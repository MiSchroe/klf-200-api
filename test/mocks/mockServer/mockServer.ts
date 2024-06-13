import { readFileSync } from "fs";

import debugModule from "debug";
import path, { dirname } from "path";
import { exit } from "process";
import { TimeoutError, timeout } from "promise-timeout";
import { Server, TLSSocket, TlsOptions } from "tls";
import { fileURLToPath } from "url";
import {
	GW_COMMON_STATUS,
	GW_INVERSE_STATUS,
	GatewayCommand,
	GatewayState,
	GatewaySubState,
	KLF200Protocol,
	KLF200_PORT,
	SLIPProtocol,
	SceneInformationEntry,
} from "../../../src";
import { ArrayBuilder } from "./ArrayBuilder";
import { AcknowledgeMessage, Command } from "./commands";
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

	function acknowledgeMessageACK(message: Command): void {
		if (process.send) {
			const ackMsg: AcknowledgeMessage = {
				messageType: "ACK",
				originalCommand: message,
			};
			process.send(ackMsg);
		}
	}

	function acknowledgeMessageERR(message: Command, errorMessage: string): void {
		if (process.send) {
			const errMsg: AcknowledgeMessage = {
				messageType: "ERR",
				originalCommand: message,
				errorMessage: errorMessage,
			};
			process.send(errMsg);
		}
	}

	process.on("message", async (message: Command) => {
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
						.addLongs(product.TimeStamp.getTime() / 1000)
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
								.addLongs(product.TimeStamp.getTime() / 1000)
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
						GW_COMMON_STATUS.SUCCESS,
						0,
					]),
				];
				return returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ;

			// case GatewayCommand.GW_COMMAND_SEND_REQ:
			//     const sessionID = getSession(frameBuffer);
			//     products[frameBuffer[45]].CurrentPositionRaw = frameBuffer.readInt16BE(10);

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
			//         .addInts(frameBuffer.readInt16BE(10))
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
})();
