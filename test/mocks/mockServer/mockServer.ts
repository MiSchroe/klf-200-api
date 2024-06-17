import { readFileSync } from "fs";

import { assert } from "console";
import debugModule from "debug";
import path, { dirname } from "path";
import { exit } from "process";
import { TimeoutError, timeout } from "promise-timeout";
import { Server, TLSSocket, TlsOptions } from "tls";
import { fileURLToPath } from "url";
import {
	GW_COMMON_STATUS,
	GW_ERROR,
	GW_INVERSE_STATUS,
	GatewayCommand,
	GatewayState,
	GatewaySubState,
	GroupType,
	KLF200Protocol,
	KLF200_PORT,
	NodeVariation,
	SLIPProtocol,
	SceneInformationEntry,
	Velocity,
	readZString,
} from "../../../src";
import { bitArrayToArray } from "../../../src/utils/BitArray";
import { ArrayBuilder } from "./ArrayBuilder";
import { AcknowledgeMessage, CommandWithGuid } from "./commands";
import { Gateway } from "./gateway";
import { Group } from "./groups";
import { Product } from "./products";
import { Scene } from "./scenes";

const debug = debugModule(`${path.parse(import.meta.filename).name}:server`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(function () {
	/*
		Run this module only, if called as a child process.
		When called as a child process, process.send will be !== undefined.
	*/
	if (process.send === undefined) {
		// debug("Not inside of child process.");
		return;
	}
	// debug("Inside of child process.");

	/*
	Based on https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae:
	1. openssl req -new -x509 -days 36500 -keyout ca-key.pem -out ca-crt.pem
	2. openssl genrsa -out server-key.pem 4096
	3. openssl req -new -key server-key.pem -out server-csr.pem
	4. openssl x509 -req -days 36500 -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem
	5. openssl verify -CAfile ca-crt.pem server-crt.pem
	6. openssl genrsa -out client1-key.pem 4096
	7. openssl req -new -key client1-key.pem -out client1-csr.pem
	8. openssl x509 -req -days 36500 -in client1-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out client1-crt.pem
	*/

	const HOST = "localhost";

	const options: TlsOptions = {
		key: readFileSync(path.join(__dirname, "server-key.pem")),
		cert: readFileSync(path.join(__dirname, "server-crt.pem")),
		ca: readFileSync(path.join(__dirname, "ca-crt.pem")),
		requestCert: true,
		rejectUnauthorized: true,
	};

	const DefaultGateway: Gateway = {
		SoftwareVersion: {
			CommandVersion: 2,
			MainVersion: 0,
			SubVersion: 0,
			BranchID: 71,
			Build: 0,
			MicroBuild: 0,
		},
		HardwareVersion: 42,
		ProductGroup: 14,
		ProductType: 3,
		ProtocolMajorVersion: 42,
		ProtocolMinorVersion: 42,
		GatewayState: GatewayState.GatewayMode_WithActuatorNodes,
		GatewaySubState: GatewaySubState.Idle,
		IPAddress: "127.0.0.1",
		NetworkMask: "255.255.255.255",
		DefaultGateway: "127.0.0.1",
		DHCP: true,
	};

	let gateway: Gateway = structuredClone(DefaultGateway);
	const products: Map<number, Product> = new Map();
	const groups: Map<number, Group> = new Map();
	const scenes: Map<number, Scene> = new Map();
	type confirmationData = {
		gatewayConfirmation: GatewayCommand;
		data: string;
	};
	const confirmations: Map<GatewayCommand, confirmationData> = new Map();
	type functionData = () => Promise<Buffer[]>;
	const functions: Map<GatewayCommand, functionData> = new Map();

	let tlsSocket: TLSSocket | undefined = undefined;

	const server = new Server(options, async function (socket) {
		debug(
			`New connection. Current number of connections: ${await new Promise((resolve, reject) => {
				server.getConnections((error, count) => {
					if (error) {
						reject(error);
					} else {
						resolve(count);
					}
				});
			})}`,
		);

		tlsSocket = socket;

		socket.on("data", async function (data: Buffer) {
			debug(`on data received: ${data.toString("hex")}`);
			const frameBuffer = KLF200Protocol.Decode(SLIPProtocol.Decode(data));
			debug(`on data received (frameBuffer): ${frameBuffer.toString("hex")}`);

			const rawBuffers = await handleFrameBuffer(socket, frameBuffer);

			debug(`on data received rawBuffers: ${JSON.stringify(rawBuffers)}`);
			for (const rawBuffer of rawBuffers) {
				const klfBuffer = SLIPProtocol.Encode(KLF200Protocol.Encode(rawBuffer));
				socket.write(klfBuffer);
			}
		});

		socket.on("end", function () {
			debug("end event received.");
			tlsSocket?.end();
			tlsSocket = undefined;
		});

		socket.on("close", (hadError: boolean) => {
			debug(`close event received. hadError: ${hadError}`);
			tlsSocket = undefined;
		});

		socket.on("error", (err) => {
			debug(`error event received: ${JSON.stringify(err)}`);
			tlsSocket = undefined;
		});
	});

	server.maxConnections = 1;

	function acknowledgeMessageACK(message: CommandWithGuid): void {
		if (process.send) {
			const ackMsg: AcknowledgeMessage = {
				messageType: "ACK",
				originalCommandGuid: message.CommandGuid,
			};
			process.send(ackMsg);
		}
	}

	function acknowledgeMessageERR(message: CommandWithGuid, errorMessage: string): void {
		if (process.send) {
			const errMsg: AcknowledgeMessage = {
				messageType: "ERR",
				originalCommandGuid: message.CommandGuid,
				errorMessage: errorMessage,
			};
			process.send(errMsg);
		}
	}

	process.on("message", async (message: CommandWithGuid) => {
		debug(`Server has received a message: ${JSON.stringify(message)}`);
		switch (message.command) {
			case "SetProduct":
				products.set(message.productId, message.product);
				acknowledgeMessageACK(message);
				break;

			case "DeleteProduct":
				products.delete(message.productId);
				acknowledgeMessageACK(message);
				break;

			case "SetGroup":
				groups.set(message.groupId, message.group);
				acknowledgeMessageACK(message);
				break;

			case "DeleteGroup":
				groups.delete(message.groupId);
				acknowledgeMessageACK(message);
				break;

			case "SetScene":
				scenes.set(message.sceneId, message.scene);
				acknowledgeMessageACK(message);
				break;

			case "DeleteScene":
				scenes.delete(message.sceneId);
				acknowledgeMessageACK(message);
				break;

			case "SetGateway":
				gateway = { ...gateway, ...message.gateway };
				acknowledgeMessageACK(message);
				break;

			case "SendData":
				const data_SendData = Buffer.from(message.data, "base64");
				tlsSocket?.write(
					SLIPProtocol.Encode(
						KLF200Protocol.Encode(addCommandAndLengthToBuffer(message.gatewayCommand, data_SendData)),
					),
				);
				acknowledgeMessageACK(message);
				break;

			case "Reset":
				gateway = structuredClone(DefaultGateway);
				products.clear();
				groups.clear();
				scenes.clear();
				confirmations.clear();
				acknowledgeMessageACK(message);
				break;

			case "Kill":
				debug("Kill command received");
				tlsSocket?.destroy();
				tlsSocket = undefined;
				debug(
					`Remaining number of connections: ${await new Promise((resolve, reject) => {
						server.getConnections((error, count) => {
							if (error) {
								reject(error);
							} else {
								resolve(count);
							}
						});
					})}`,
				);
				server.close((err) => {
					debug(`Close event in kill command received. err: ${JSON.stringify(err)}`);
					if (err) {
						acknowledgeMessageERR(message, `${err}`);
						// debug(`Close with error: ${err}.`);
						exit(1);
					} else {
						acknowledgeMessageACK(message);
						// debug("Server closed.");
						exit(0);
					}
				});
				break;

			case "SetConfirmation":
				confirmations.set(message.gatewayCommand, {
					gatewayConfirmation: message.gatewayConfirmation,
					data: message.data,
				});
				acknowledgeMessageACK(message);
				break;

			case "SetFunction":
				functions.set(message.gatewayCommand, Function("f", `"use strict";\n${message.func}`) as functionData);
				acknowledgeMessageACK(message);
				break;

			case "CloseConnection":
				if (tlsSocket) {
					try {
						await timeout(
							// Try to end the "good" way:
							new Promise<void>((resolve) => {
								tlsSocket?.end(() => {
									acknowledgeMessageACK(message);
								});
								tlsSocket = undefined;
								resolve();
							}),
							1000,
						);
					} catch (error) {
						if (error instanceof TimeoutError) {
							// Otherwise destroy the socket after 1sec.
							tlsSocket?.destroy();
							tlsSocket = undefined;
							acknowledgeMessageACK(message);
						} else {
							throw error;
						}
					}
				} else {
					acknowledgeMessageACK(message);
				}
				break;

			default:
				acknowledgeMessageERR(message, "Unknown message.");
				break;
		}
	});

	// Check for excluded ports:
	// netsh interface ipv4 show excludedportrange protocol=tcp
	// Try to fix:
	// net stop winnat
	// net start winnat
	server.on("error", function (error) {
		console.error(error);
		server.close(() => {
			process.exit(1);
		});
		setTimeout(() => {
			process.exit(1);
		}).unref();
	});

	server.listen(KLF200_PORT, HOST, () => {
		if (process.send !== undefined) {
			process.send("ready");
		}
	});

	async function handleFrameBuffer(socket: TLSSocket, frameBuffer: Buffer): Promise<Buffer[]> {
		const commandRequest: GatewayCommand = frameBuffer.readUInt16BE(1);
		debug(`handleFrameBuffer commandRequest: ${commandRequest}`);

		// First check, if we have a confirmation or function set for the command
		const confirmationData = confirmations.get(commandRequest);
		if (confirmationData) {
			confirmations.delete(commandRequest);
			return [
				addCommandAndLengthToBuffer(
					confirmationData.gatewayConfirmation,
					Buffer.from(confirmationData.data, "base64"),
				),
			];
		}
		const functionData = functions.get(commandRequest);
		if (functionData) {
			functions.delete(commandRequest);
			return await functionData();
		}

		// Now, we do the default handling
		switch (commandRequest) {
			// Gateway & general messages:
			case GatewayCommand.GW_PASSWORD_ENTER_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_PASSWORD_ENTER_CFM, [GW_COMMON_STATUS.SUCCESS])];

			case GatewayCommand.GW_PASSWORD_CHANGE_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_PASSWORD_CHANGE_CFM, [GW_COMMON_STATUS.SUCCESS]),
					addCommandAndLengthToBuffer(GatewayCommand.GW_PASSWORD_CHANGE_NTF, frameBuffer.subarray(33, 65)),
				];

			case GatewayCommand.GW_GET_VERSION_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_VERSION_CFM, [
						gateway.SoftwareVersion.CommandVersion,
						gateway.SoftwareVersion.MainVersion,
						gateway.SoftwareVersion.SubVersion,
						gateway.SoftwareVersion.BranchID,
						gateway.SoftwareVersion.Build,
						gateway.SoftwareVersion.MicroBuild,
						gateway.HardwareVersion,
						gateway.ProductGroup,
						gateway.ProductType,
					]),
				];

			case GatewayCommand.GW_GET_PROTOCOL_VERSION_REQ:
				return [
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_GET_PROTOCOL_VERSION_CFM,
						new ArrayBuilder()
							.addInts(gateway.ProtocolMajorVersion, gateway.ProtocolMinorVersion)
							.toBuffer(),
					),
				];

			case GatewayCommand.GW_GET_STATE_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_STATE_CFM, [
						gateway.GatewayState,
						gateway.GatewaySubState,
						0,
						0,
						0,
						0,
					]),
				];

			case GatewayCommand.GW_SET_UTC_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_UTC_CFM, [])];

			case GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_RTC_SET_TIME_ZONE_CFM, [GW_INVERSE_STATUS.SUCCESS]),
				];

			case GatewayCommand.GW_REBOOT_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_REBOOT_CFM, [])];

			case GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_FACTORY_DEFAULT_CFM, [])];

			case GatewayCommand.GW_LEAVE_LEARN_STATE_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_LEAVE_LEARN_STATE_CFM, [GW_INVERSE_STATUS.SUCCESS]),
				];

			case GatewayCommand.GW_GET_NETWORK_SETUP_REQ:
				return [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_NETWORK_SETUP_CFM, [
						...gateway.IPAddress.split(".").map(Number),
						...gateway.NetworkMask.split(".").map(Number),
						...gateway.DefaultGateway.split(".").map(Number),
						gateway.DHCP ? 1 : 0,
					]),
				];

			case GatewayCommand.GW_SET_NETWORK_SETUP_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NETWORK_SETUP_CFM, [])];

			case GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_CFM, [])];

			case GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_CFM, [])];

			// Products
			case GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ:
				const returnBuffers_GW_GET_ALL_NODES_INFORMATION_REQ: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_CFM, [
						GW_COMMON_STATUS.SUCCESS,
						products.size,
					]),
				];
				for (const product of products.values()) {
					const ab = new ArrayBuilder();
					ab.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							product.ProductGroup,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							...Buffer.from(product.SerialNumber, "base64"),
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.CurrentPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(Date.parse(product.TimeStamp) / 1000)
						.addBytes(0)
						.fill(5 * 4);
					returnBuffers_GW_GET_ALL_NODES_INFORMATION_REQ.push(
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF, ab.toBuffer()),
					);
				}
				returnBuffers_GW_GET_ALL_NODES_INFORMATION_REQ.push(
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF, []),
				);
				return returnBuffers_GW_GET_ALL_NODES_INFORMATION_REQ;

			case GatewayCommand.GW_GET_NODE_INFORMATION_REQ:
				const nodeID = frameBuffer[3];
				const product = products.get(nodeID);

				if (product === undefined) {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_NODE_INFORMATION_CFM, [
							GW_COMMON_STATUS.INVALID_NODE_ID,
							nodeID,
						]),
					];
				} else {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_NODE_INFORMATION_CFM, [
							GW_COMMON_STATUS.SUCCESS,
							nodeID,
						]),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
							new ArrayBuilder()
								.addBytes(product.NodeID)
								.addInts(product.Order)
								.addBytes(product.Placement)
								.addString(product.Name, 64)
								.addBytes(product.Velocity)
								.addInts((product.TypeID << 6) | product.SubType)
								.addBytes(
									product.ProductGroup,
									product.ProductType,
									product.NodeVariation,
									product.PowerSaveMode,
									...Buffer.from(product.SerialNumber, "base64"),
									product.State,
								)
								.addInts(
									product.CurrentPositionRaw,
									product.CurrentPositionRaw,
									product.FP1CurrentPositionRaw,
									product.FP2CurrentPositionRaw,
									product.FP3CurrentPositionRaw,
									product.FP4CurrentPositionRaw,
									product.RemainingTime,
								)
								.addLongs(Date.parse(product.TimeStamp) / 1000)
								.addBytes(0)
								.fill(5 * 4)
								.toBuffer(),
						),
					];
				}

			case GatewayCommand.GW_GET_LIMITATION_STATUS_REQ:
				return [
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_GET_LIMITATION_STATUS_CFM,
						new ArrayBuilder()
							.addInts(getSession(frameBuffer))
							.addBytes(GW_INVERSE_STATUS.SUCCESS)
							.toBuffer(),
					),
					// addCommandAndLengthToBuffer(GatewayCommand.GW_LIMITATION_STATUS_NTF, new ArrayBuilder()
					// .addInts(getSession(frameBuffer))
					// .addBytes(frameBuffer.readInt8(5), frameBuffer.readInt8(6))
					// .addInts(0, 0xC800)
					// .addBytes(0, 253)
					// .toBuffer()
					// ),
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(getSession(frameBuffer)).toBuffer(),
					),
				];

			// Scenes
			case GatewayCommand.GW_GET_SCENE_LIST_REQ:
				let remainingScenes = scenes.size;
				const returnBuffers_GW_GET_SCENE_LIST_REQ: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_LIST_CFM, [remainingScenes]),
				];
				if (remainingScenes === 0) {
					returnBuffers_GW_GET_SCENE_LIST_REQ.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_SCENE_LIST_NTF,
							new ArrayBuilder().addBytes(0, 0).toBuffer(),
						),
					);
				} else {
					Array.from(scenes.values())
						.reduce((resultArray, item, index) => {
							// Convert the scenes into chunks of 3:
							const chunkIndex = Math.floor(index / 3);

							if (!resultArray[chunkIndex]) {
								resultArray[chunkIndex] = []; // start a new chunk
							}

							resultArray[chunkIndex].push(item);

							return resultArray;
						}, [] as Scene[][])
						.forEach((chunk) => {
							// Build GW_GET_SCENE_LIST_NTF frame
							remainingScenes -= chunk.length;
							const ab = new ArrayBuilder().addBytes(chunk.length);
							for (const scene of chunk) {
								ab.addBytes(scene.SceneID).addString(scene.Name, 64);
							}
							ab.addBytes(remainingScenes);
							returnBuffers_GW_GET_SCENE_LIST_REQ.push(
								addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_LIST_NTF, ab.toBuffer()),
							);
						});
				}
				return returnBuffers_GW_GET_SCENE_LIST_REQ;

			case GatewayCommand.GW_GET_SCENE_INFORMATION_REQ:
				const sceneID = frameBuffer[3];
				const scene = scenes.get(sceneID);

				if (scene === undefined) {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_INFORMATION_CFM, [
							GW_COMMON_STATUS.ERROR,
							sceneID,
						]),
					];
				} else {
					const returnBuffers_GW_GET_SCENE_INFORMATION_REQ: Buffer[] = [
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_INFORMATION_CFM, [
							GW_COMMON_STATUS.SUCCESS,
							sceneID,
						]),
					];

					let remainingNodes = scene.Nodes.length;

					scene.Nodes.reduce((resultArray, item, index) => {
						// Convert the scenes into chunks of 45:
						const chunkIndex = Math.floor(index / 45);

						if (!resultArray[chunkIndex]) {
							resultArray[chunkIndex] = []; // start a new chunk
						}

						resultArray[chunkIndex].push(item);

						return resultArray;
					}, [] as SceneInformationEntry[][]).forEach((chunk) => {
						// Build GW_GET_SCENE_INFORMATION_NTF frame
						remainingNodes -= chunk.length;
						const ab = new ArrayBuilder()
							.addBytes(sceneID)
							.addString(scene.Name, 64)
							.addBytes(chunk.length);
						for (const sceneInformationEntry of chunk) {
							ab.addBytes(sceneInformationEntry.NodeID, sceneInformationEntry.ParameterID).addInts(
								sceneInformationEntry.ParameterValue,
							);
						}
						ab.addBytes(remainingNodes);
						returnBuffers_GW_GET_SCENE_INFORMATION_REQ.push(
							addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_INFORMATION_NTF, ab.toBuffer()),
						);
					});
					return returnBuffers_GW_GET_SCENE_INFORMATION_REQ;
				}

			// Groups
			case GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_REQ:
				const returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_CFM, [
						groups.size === 0 ? GW_COMMON_STATUS.INVALID_NODE_ID : GW_COMMON_STATUS.SUCCESS,
						groups.size,
					]),
				];
				const useFilter: boolean = frameBuffer.readInt8(3) !== 0;
				const groupType: GroupType = frameBuffer.readInt8(4);
				let groupNtfSent: boolean = false;
				for (const group of groups.values()) {
					if (!useFilter || groupType === group.GroupType) {
						groupNtfSent = true;
						returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ.push(
							addCommandAndLengthToBuffer(
								GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF,
								new ArrayBuilder()
									.addBytes(group.GroupID)
									.addInts(group.Order)
									.addBytes(group.Placement)
									.addString(group.Name, 64)
									.addBytes(group.Velocity, group.NodeVariation, group.GroupType, group.Nodes.length)
									.addBitArray(25, group.Nodes)
									.addInts(group.Revision)
									.toBuffer(),
							),
						);
					}
				}
				if (!useFilter || groupType === GroupType.House) {
					groupNtfSent = true;
					returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF,
							new ArrayBuilder()
								.addBytes(0) // GroupID
								.addInts(0) // Order
								.addBytes(0) // Placement
								.addString("", 64) // Name
								.addBytes(Velocity.Default, NodeVariation.NotSet, GroupType.House, products.size) // Velocity, NodeVariation, GroupType, Nodes.length
								.addBitArray(25, Array.from(products.keys())) // Nodes list
								.addInts(0) // Revision
								.toBuffer(),
						),
					);
				}
				if (!useFilter || groupType === GroupType.All) {
					groupNtfSent = true;
					returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF,
							new ArrayBuilder()
								.addBytes(1) // GroupID
								.addInts(0) // Order
								.addBytes(0) // Placement
								.addString("", 64) // Name
								.addBytes(Velocity.Default, NodeVariation.NotSet, GroupType.All, products.size) // Velocity, NodeVariation, GroupType, Nodes.length
								.addBitArray(25, Array.from(products.keys())) // Nodes list
								.addInts(0) // Revision
								.toBuffer(),
						),
					);
				}
				if (groupNtfSent) {
					returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ.push(
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, []),
					);
				}
				return returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ;

			case GatewayCommand.GW_SET_GROUP_INFORMATION_REQ: {
				const groupId = frameBuffer.readInt8(3);
				if (!groups.has(groupId)) {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_ERROR_NTF, [GW_ERROR.InvalidSystemTableIndex]),
					];
				}
				const group = groups.get(groupId);
				assertGroupIdShouldExist(group, groupId);

				// Check Group Type and revision
				const revision = frameBuffer.readUInt16BE(100);
				const groupType = frameBuffer.readInt8(73);
				if (
					groupId === 0 ||
					groupId === 1 ||
					groupType === GroupType.All ||
					groupType === GroupType.House ||
					groupType !== group?.GroupType ||
					revision !== group.Revision
				) {
					return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_GROUP_INFORMATION_CFM, [1, groupId])];
				} else {
					group.Order = frameBuffer.readUInt16BE(4);
					group.Placement = frameBuffer.readInt8(6);
					group.Name = readZString(frameBuffer.subarray(7, 71));
					group.Velocity = frameBuffer.readInt8(71);
					group.NodeVariation = frameBuffer.readInt8(72);
					group.Nodes = bitArrayToArray(frameBuffer.subarray(75, 100));
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_SET_GROUP_INFORMATION_CFM, [0, groupId]),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF,
							new ArrayBuilder()
								.addBytes(1, groupId)
								.addInts(group.Order)
								.addBytes(group.Placement)
								.addString(group.Name, 64)
								.addBytes(group.Velocity, group.NodeVariation, group.GroupType, group.Nodes.length)
								.addBitArray(25, group.Nodes)
								.addInts(group.Revision)
								.toBuffer(),
						),
					];
				}
			}

			case GatewayCommand.GW_GET_GROUP_INFORMATION_REQ: {
				const groupId = frameBuffer.readInt8(3);
				if (!groups.has(groupId)) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_GROUP_INFORMATION_CFM,
							new ArrayBuilder().addBytes(2, groupId).toBuffer(),
						),
					];
				}
				const group = groups.get(groupId);
				assertGroupIdShouldExist(group, groupId);
				return [
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_GET_GROUP_INFORMATION_CFM,
						new ArrayBuilder().addBytes(0, groupId).toBuffer(),
					),
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_GET_GROUP_INFORMATION_NTF,
						new ArrayBuilder()
							.addBytes(group!.GroupID)
							.addInts(group!.Order)
							.addBytes(group!.Placement)
							.addString(group!.Name, 64)
							.addBytes(group!.Velocity, group!.NodeVariation, group!.GroupType, group!.Nodes.length)
							.addBitArray(25, group!.Nodes)
							.addInts(group!.Revision)
							.toBuffer(),
					),
				];
			}

			case GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const commandOriginator = frameBuffer.readInt8(5);
				// const priorityLevel = frameBuffer.readInt8(6);
				const groupId = frameBuffer.readInt8(7);
				const parameterId = frameBuffer.readInt8(8);
				const position = frameBuffer.readUInt16BE(9);
				// const velocity = frameBuffer.readInt8(11);
				// const priorityLevelLock = frameBuffer.readInt8(12);
				// const PL = frameBuffer.readUInt16BE(13);
				// const lockTime = frameBuffer.readInt8(15);

				if (!groups.has(groupId)) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(1).toBuffer(),
						),
					];
				}
				const group = groups.get(groupId);
				assertGroupIdShouldExist(group, groupId);
				const finalResults: Buffer[] = [];

				finalResults.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_CFM,
						new ArrayBuilder().addInts(sessionId).addBytes(0).toBuffer(),
					),
				);

				// One GW_COMMAND_RUN_STATUS_NTF for each product in group
				for (const productId of group!.Nodes) {
					const product = products.get(productId);
					finalResults.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(commandOriginator, productId, parameterId)
								.addInts(getProductCurrentParameter(product!, parameterId))
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer(),
						),
					);
				}

				// One set of GW_COMMAND_REMAINING_TIME_NTF and GW_COMMAND_RUN_STATUS_NTF
				for (const productId of group!.Nodes) {
					const product = products.get(productId);
					setProductCurrentParameter(product!, parameterId, position);
					finalResults.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(productId, parameterId)
								.addInts(42)
								.toBuffer(),
						),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(commandOriginator, productId, parameterId)
								.addInts(getProductCurrentParameter(product!, parameterId))
								.addBytes(0, 1, 0, 0, 0, 0)
								.toBuffer(),
						),
					);
				}

				// Add GW_SESSION_FINISHED_NTF
				finalResults.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(sessionId).toBuffer(),
					),
				);

				return finalResults;
			}

			// case GatewayCommand.GW_COMMAND_SEND_REQ:
			//     const sessionID = getSession(frameBuffer);
			//     products[frameBuffer[45]].CurrentPositionRaw = frameBuffer.readUInt16BE(10);

			//     let ab = new ArrayBuilder()
			//         .addInts(sessionID)
			//         .addBytes(CommandStatus.CommandAccepted);
			//     const returnBuffers_GW_COMMAND_SEND_REQ: Buffer[] = [addCommandAndLengthToBuffer(GatewayCommand.GW_COMMAND_SEND_CFM, ab.toBuffer())];
			//     returnBuffers_GW_COMMAND_SEND_REQ.push(addCommandAndLengthToBuffer(GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF, new ArrayBuilder()
			//         .addBytes(frameBuffer[45], NodeOperatingState.Done)
			//         .addInts(products[frameBuffer[45]].CurrentPositionRaw,
			//             products[frameBuffer[45]].CurrentPositionRaw,
			//             products[frameBuffer[45]].FP1CurrentPositionRaw,
			//             products[frameBuffer[45]].FP2CurrentPositionRaw,
			//             products[frameBuffer[45]].FP3CurrentPositionRaw,
			//             products[frameBuffer[45]].FP4CurrentPositionRaw,
			//             0)
			//         .addLongs(products[frameBuffer[45]].TimeStamp.getTime() / 1000)
			//         .toBuffer()));
			//     ab = new ArrayBuilder()
			//         .addInts(sessionID)
			//         .addBytes(StatusOwner.User, frameBuffer[45], 0)
			//         .addInts(frameBuffer.readUInt16BE(10))
			//         .addBytes(RunStatus.ExecutionCompleted, StatusReply.Ok)
			//         .addLongs(0);
			//     returnBuffers_GW_COMMAND_SEND_REQ.push(addCommandAndLengthToBuffer(GatewayCommand.GW_COMMAND_RUN_STATUS_NTF, ab.toBuffer()));
			//     returnBuffers_GW_COMMAND_SEND_REQ.push(addCommandAndLengthToBuffer(GatewayCommand.GW_SESSION_FINISHED_NTF, new ArrayBuilder().addInts(sessionID).toBuffer()));

			//     return returnBuffers_GW_COMMAND_SEND_REQ;

			default:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_ERROR_NTF, [255])];
		}
	}

	function getSession(buf: Buffer): number {
		return buf.readUInt16BE(3);
	}

	function addCommandAndLengthToBuffer(command: GatewayCommand, buffer: ArrayLike<number>): Buffer {
		const resultBuffer = Buffer.alloc(3 + buffer.length);
		resultBuffer.set(buffer, 3);
		resultBuffer.writeUInt16BE(command, 1);
		resultBuffer.writeInt8(resultBuffer.byteLength, 0);
		return resultBuffer;
	}

	function assertGroupIdShouldExist(group: Group | undefined, groupId: number): void {
		assert(group !== undefined, `Group ID ${groupId} should exist.`);
	}

	function getProductCurrentParameter(product: Product, parameterId: number): number {
		switch (parameterId) {
			case 0:
				return product.CurrentPositionRaw;

			case 1:
				return product.FP1CurrentPositionRaw;

			case 2:
				return product.FP2CurrentPositionRaw;

			case 3:
				return product.FP3CurrentPositionRaw;

			case 4:
				return product.FP4CurrentPositionRaw;

			default:
				throw new Error(`Only MP and FP1-4 are supported. You tried ${parameterId}.`);
		}
	}

	function setProductCurrentParameter(product: Product, parameterId: number, newValue: number): void {
		switch (parameterId) {
			case 0:
				product.CurrentPositionRaw = newValue;
				break;

			case 1:
				product.FP1CurrentPositionRaw = newValue;
				break;

			case 2:
				product.FP2CurrentPositionRaw = newValue;
				break;

			case 3:
				product.FP3CurrentPositionRaw = newValue;
				break;

			case 4:
				product.FP4CurrentPositionRaw = newValue;
				break;

			default:
				throw new Error(`Only MP and FP1-4 are supported. You tried ${parameterId}.`);
		}
	}
})();
