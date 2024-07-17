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
	StatusType,
	Velocity,
	readZString,
} from "../../../src";
import { bitArrayToArray } from "../../../src/utils/BitArray";
import { ArrayBuilder } from "./ArrayBuilder.js";
import { AcknowledgeMessage, CommandWithGuid } from "./commands.js";
import { Gateway } from "./gateway.js";
import { Group } from "./groups.js";
import { Limitation } from "./limitations.js";
import { Product } from "./products.js";
import { Scene } from "./scenes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule(`${path.parse(__filename).name}:server`);

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
	const limitations: Map<string, Limitation> = new Map();
	type confirmationData = {
		gatewayConfirmation: GatewayCommand;
		data: string;
	};
	const confirmations: Map<GatewayCommand, confirmationData> = new Map();
	type functionData = (frameBuffer: Buffer) => Promise<Buffer[]>;
	const functions: Map<GatewayCommand, functionData> = new Map();

	let tlsSocket: TLSSocket | undefined = undefined;

	const server = new Server(options, (socket) => {
		const handler = async function (socket: TLSSocket): Promise<void> {
			debug(
				`New connection. Current number of connections: ${await new Promise<number>((resolve, reject) => {
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

			socket.on("data", (data: Buffer) => {
				const handler = async function (data: Buffer): Promise<void> {
					debug(`on data received: ${data.toString("hex")}`);
					const frameBuffer = KLF200Protocol.Decode(SLIPProtocol.Decode(data));
					debug(`on data received (frameBuffer): ${frameBuffer.toString("hex")}`);

					const rawBuffers = await handleFrameBuffer(socket, frameBuffer);

					debug(`on data received rawBuffers: ${JSON.stringify(rawBuffers)}`);
					for (const rawBuffer of rawBuffers) {
						const klfBuffer = SLIPProtocol.Encode(KLF200Protocol.Encode(rawBuffer));
						socket.write(klfBuffer);
					}
				};

				handler(data).catch((error) => {
					debug(`Error in socket on data handler: ${error}`);
				});
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
		};

		handler(socket).catch((error) => {
			debug(`Error in New server handler: ${error}`);
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

	process.on("message", (message: CommandWithGuid) => {
		const handler = async (message: CommandWithGuid): Promise<void> => {
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

				case "SetLimitation":
					limitations.set(
						`${message.limitation.NodeID}:${message.limitation.ParameterID}`,
						message.limitation,
					);
					acknowledgeMessageACK(message);
					break;

				case "DeleteLimitation":
					limitations.delete(`${message.nodeId}:${message.parameterId}`);
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
					limitations.clear();
					confirmations.clear();
					acknowledgeMessageACK(message);
					break;

				case "Kill":
					debug("Kill command received");
					tlsSocket?.destroy();
					tlsSocket = undefined;
					debug(
						`Remaining number of connections: ${await new Promise<number>((resolve, reject) => {
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
							acknowledgeMessageERR(message, `${err.message}`);
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
					functions.set(
						message.gatewayCommand,
						// eslint-disable-next-line @typescript-eslint/no-implied-eval
						Function("frameBuffer", `"use strict";\n${message.func}`) as functionData,
					);
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
		};
		handler(message).catch((error) => {
			console.error(error);
		});
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
			return await functionData(frameBuffer);
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
			case GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ: {
				if (products.size === 0) {
					return [addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_CFM, [1, 0])];
				}
				const returnBuffers: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_CFM, [
						GW_COMMON_STATUS.SUCCESS,
						products.size,
					]),
				];
				for (const product of products.values()) {
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
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
							0,
							...Buffer.from(product.SerialNumber, "base64"),
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(Date.parse(product.TimeStamp) / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					returnBuffers.push(
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF, ab.toBuffer()),
					);
				}
				returnBuffers.push(
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF, []),
				);
				return returnBuffers;
			}

			case GatewayCommand.GW_GET_NODE_INFORMATION_REQ: {
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
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
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
							0,
							...Buffer.from(product.SerialNumber, "base64"),
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(Date.parse(product.TimeStamp) / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_NODE_INFORMATION_CFM, [
							GW_COMMON_STATUS.SUCCESS,
							nodeID,
						]),
						addCommandAndLengthToBuffer(GatewayCommand.GW_GET_NODE_INFORMATION_NTF, ab.toBuffer()),
					];
				}
			}

			case GatewayCommand.GW_SET_NODE_NAME_REQ: {
				const nodeId = frameBuffer.readUInt8(3);
				const name = readZString(frameBuffer.subarray(4, 68));
				const product = products.get(nodeId);
				if (product === undefined) {
					return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_NAME_CFM, [2, nodeId])];
				} else {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_NAME_CFM, [0, nodeId]),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
							new ArrayBuilder()
								.addBytes(nodeId)
								.addString(name, 64)
								.addInts(product.Order)
								.addBytes(product.Placement, product.NodeVariation)
								.toBuffer(),
						),
					];
				}
			}

			case GatewayCommand.GW_SET_NODE_VARIATION_REQ: {
				const nodeId = frameBuffer.readUInt8(3);
				const nodeVariation = frameBuffer.readUInt8(4);
				const product = products.get(nodeId);
				if (product === undefined) {
					return [addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_VARIATION_CFM, [2, nodeId])];
				} else {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_VARIATION_CFM, [0, nodeId]),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
							new ArrayBuilder()
								.addBytes(nodeId)
								.addString(product.Name, 64)
								.addInts(product.Order)
								.addBytes(product.Placement, nodeVariation)
								.toBuffer(),
						),
					];
				}
			}

			case GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ: {
				const nodeId = frameBuffer.readUInt8(3);
				const order = frameBuffer.readUInt16BE(4);
				const placement = frameBuffer.readUInt8(6);
				const product = products.get(nodeId);
				if (product === undefined) {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_CFM, [2, nodeId]),
					];
				} else {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_CFM, [0, nodeId]),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
							new ArrayBuilder()
								.addBytes(nodeId)
								.addString(product.Name, 64)
								.addInts(order)
								.addBytes(placement, product.NodeVariation)
								.toBuffer(),
						),
					];
				}
			}

			case GatewayCommand.GW_STATUS_REQUEST_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const numberOfNodes = frameBuffer.readUInt8(5);
				const nodes = Array.from(frameBuffer.subarray(6, 6 + numberOfNodes));
				const statusType = frameBuffer.readUInt8(26) as StatusType;
				const fp = getFunctionalParamters(frameBuffer.readUInt8(27), frameBuffer.readUInt8(28));
				const resultBuffers: Buffer[] = [];

				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_STATUS_REQUEST_CFM,
						new ArrayBuilder().addInts(sessionId).addBytes(1).toBuffer(),
					),
				);

				if (statusType === StatusType.RequestMainInfo) {
					for (const nodeId of nodes) {
						const product = products.get(nodeId)!;
						resultBuffers.push(
							addCommandAndLengthToBuffer(
								GatewayCommand.GW_STATUS_REQUEST_NTF,
								new ArrayBuilder()
									.addInts(sessionId)
									.addBytes(13, product.NodeID, product.RunStatus, product.StatusReply, statusType)
									.addInts(
										product.TargetPositionRaw,
										product.CurrentPositionRaw,
										product.RemainingTime,
									)
									.addLongs(0)
									.addBytes(13)
									.toBuffer(),
							),
						);
					}
				} else {
					for (const nodeId of nodes) {
						const product = products.get(nodeId)!;
						const ab = new ArrayBuilder()
							.addInts(sessionId)
							.addBytes(
								13,
								product.NodeID,
								product.RunStatus,
								product.StatusReply,
								statusType,
								fp.length + 1,
								0,
							)
							.addInts(
								statusType === StatusType.RequestCurrentPosition
									? product.CurrentPositionRaw
									: statusType === StatusType.RequestTargetPosition
										? product.TargetPositionRaw
										: product.RemainingTime,
							);
						for (const functionalParameter of fp) {
							ab.addBytes(functionalParameter + 1);
							switch (functionalParameter) {
								case 0:
									ab.addInts(
										statusType === StatusType.RequestCurrentPosition
											? product.FP1CurrentPositionRaw
											: statusType === StatusType.RequestTargetPosition
												? product.FP1TargetPositionRaw
												: product.RemainingTime,
									);
									break;

								case 1:
									ab.addInts(
										statusType === StatusType.RequestCurrentPosition
											? product.FP2CurrentPositionRaw
											: statusType === StatusType.RequestTargetPosition
												? product.FP2TargetPositionRaw
												: product.RemainingTime,
									);
									break;

								case 2:
									ab.addInts(
										statusType === StatusType.RequestCurrentPosition
											? product.FP3CurrentPositionRaw
											: statusType === StatusType.RequestTargetPosition
												? product.FP3TargetPositionRaw
												: product.RemainingTime,
									);
									break;

								case 3:
									ab.addInts(
										statusType === StatusType.RequestCurrentPosition
											? product.FP4CurrentPositionRaw
											: statusType === StatusType.RequestTargetPosition
												? product.FP4TargetPositionRaw
												: product.RemainingTime,
									);
									break;

								default:
									throw new Error(`Only FP1-4 are supported. You tried ${functionalParameter + 1}.`);
							}
						}

						resultBuffers.push(
							addCommandAndLengthToBuffer(GatewayCommand.GW_STATUS_REQUEST_NTF, ab.toBuffer()),
						);
					}
				}

				// GW_SESSION_FINISHED_NTF
				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(sessionId).toBuffer(),
					),
				);

				return resultBuffers;
			}

			case GatewayCommand.GW_GET_LIMITATION_STATUS_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const numberOfNodes = frameBuffer.readUInt8(5);
				const nodes = Array.from(frameBuffer.subarray(6, 6 + numberOfNodes));
				const parameterId = frameBuffer.readUInt8(26);
				const limitationType = frameBuffer.readUInt8(27);
				if (nodes.some((node) => !products.has(node))) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_GET_LIMITATION_STATUS_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(GW_INVERSE_STATUS.ERROR).toBuffer(),
						),
					];
				}
				const resultBuffers: Buffer[] = [];
				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_GET_LIMITATION_STATUS_CFM,
						new ArrayBuilder().addInts(sessionId).addBytes(GW_INVERSE_STATUS.SUCCESS).toBuffer(),
					),
				);
				for (const node of nodes) {
					const limitation = limitations.get(`${node}:${parameterId}`);
					if (limitation !== undefined) {
						resultBuffers.push(
							addCommandAndLengthToBuffer(
								GatewayCommand.GW_LIMITATION_STATUS_NTF,
								new ArrayBuilder()
									.addInts(sessionId)
									.addBytes(node, parameterId)
									.addInts(
										limitationType === 0 ? limitation.MinValue : 0,
										limitationType === 1 ? limitation.MaxValue : 0,
									)
									.addBytes(limitation.LimitationOriginator, limitation.LimitationTime)
									.toBuffer(),
							),
						);
					}
				}

				// GW_SESSION_FINISHED_NTF
				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(sessionId).toBuffer(),
					),
				);

				return resultBuffers;
			}

			case GatewayCommand.GW_SET_LIMITATION_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				const numberOfNodes = frameBuffer.readUInt8(7);
				const nodes = Array.from(frameBuffer.subarray(8, 8 + numberOfNodes));
				const parameterId = frameBuffer.readUInt8(28);
				const limitationValueMin = frameBuffer.readUInt16BE(29);
				const limitationValueMax = frameBuffer.readUInt16BE(31);
				const limitationTime = frameBuffer.readUInt8(33);
				if (nodes.some((node) => !products.has(node))) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_SET_LIMITATION_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(GW_INVERSE_STATUS.ERROR).toBuffer(),
						),
					];
				}
				const resultBuffers: Buffer[] = [];
				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SET_LIMITATION_CFM,
						new ArrayBuilder().addInts(sessionId).addBytes(GW_INVERSE_STATUS.SUCCESS).toBuffer(),
					),
				);
				for (const node of nodes) {
					const limitation = limitations.get(`${node}:${parameterId}`);
					if (limitation !== undefined) {
						resultBuffers.push(
							addCommandAndLengthToBuffer(
								GatewayCommand.GW_LIMITATION_STATUS_NTF,
								new ArrayBuilder()
									.addInts(sessionId)
									.addBytes(node, parameterId)
									.addInts(limitationValueMin, limitationValueMax)
									.addBytes(commandOriginator, limitationTime)
									.toBuffer(),
							),
						);
					}
					const product = products.get(node);
					resultBuffers.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(commandOriginator, node, parameterId)
								.addInts(getProductCurrentParameter(product!, parameterId))
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer(),
						),
					);
				}

				// GW_SESSION_FINISHED_NTF
				resultBuffers.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(sessionId).toBuffer(),
					),
				);

				return resultBuffers;
			}

			// Scenes
			case GatewayCommand.GW_GET_SCENE_LIST_REQ: {
				let remainingScenes = scenes.size;
				const returnBuffers: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_LIST_CFM, [remainingScenes]),
				];
				if (remainingScenes === 0) {
					returnBuffers.push(
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
							returnBuffers.push(
								addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_LIST_NTF, ab.toBuffer()),
							);
						});
				}
				return returnBuffers;
			}

			case GatewayCommand.GW_GET_SCENE_INFORMATION_REQ: {
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
					const returnBuffers: Buffer[] = [
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
						returnBuffers.push(
							addCommandAndLengthToBuffer(GatewayCommand.GW_GET_SCENE_INFORMATION_NTF, ab.toBuffer()),
						);
					});
					return returnBuffers;
				}
			}

			case GatewayCommand.GW_ACTIVATE_SCENE_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				const sceneId = frameBuffer.readUInt8(7);
				// const velocity = frameBuffer.readUInt8(8);
				if (!scenes.has(sceneId)) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_ACTIVATE_SCENE_CFM,
							new ArrayBuilder().addBytes(1).addInts(sessionId).toBuffer(),
						),
					];
				}
				const scene = scenes.get(sceneId);
				const finalResults: Buffer[] = [];

				finalResults.push(
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_ACTIVATE_SCENE_CFM,
						new ArrayBuilder().addBytes(0).addInts(sessionId).toBuffer(),
					),
				);

				// One GW_COMMAND_RUN_STATUS_NTF for each product in group
				for (const sceneInformationEntry of scene!.Nodes) {
					const product = products.get(sceneInformationEntry.NodeID);
					finalResults.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(
									commandOriginator,
									sceneInformationEntry.NodeID,
									sceneInformationEntry.ParameterID,
								)
								.addInts(getProductCurrentParameter(product!, sceneInformationEntry.ParameterID))
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer(),
						),
					);
				}

				// One set of GW_COMMAND_REMAINING_TIME_NTF and GW_COMMAND_RUN_STATUS_NTF
				for (const sceneInformationEntry of scene!.Nodes) {
					const product = products.get(sceneInformationEntry.NodeID);
					setProductCurrentParameter(
						product!,
						sceneInformationEntry.ParameterID,
						sceneInformationEntry.ParameterValue,
					);
					finalResults.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(sceneInformationEntry.NodeID, sceneInformationEntry.ParameterID)
								.addInts(42)
								.toBuffer(),
						),
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							new ArrayBuilder()
								.addInts(sessionId)
								.addBytes(
									commandOriginator,
									sceneInformationEntry.NodeID,
									sceneInformationEntry.ParameterID,
								)
								.addInts(getProductCurrentParameter(product!, sceneInformationEntry.ParameterID))
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

			case GatewayCommand.GW_STOP_SCENE_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				// const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				const sceneId = frameBuffer.readUInt8(7);
				if (!scenes.has(sceneId)) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_STOP_SCENE_CFM,
							new ArrayBuilder().addBytes(1).addInts(sessionId).toBuffer(),
						),
					];
				}
				return [
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_STOP_SCENE_CFM,
						new ArrayBuilder().addBytes(0).addInts(sessionId).toBuffer(),
					),
					addCommandAndLengthToBuffer(
						GatewayCommand.GW_SESSION_FINISHED_NTF,
						new ArrayBuilder().addInts(sessionId).toBuffer(),
					),
				];
			}

			// Groups
			case GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_REQ:
				const returnBuffers_GW_GET_ALL_GROUPS_INFORMATION_REQ: Buffer[] = [
					addCommandAndLengthToBuffer(GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_CFM, [
						groups.size === 0 ? GW_COMMON_STATUS.INVALID_NODE_ID : GW_COMMON_STATUS.SUCCESS,
						groups.size,
					]),
				];
				const useFilter: boolean = frameBuffer.readUInt8(3) !== 0;
				const groupType: GroupType = frameBuffer.readUInt8(4);
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
				const groupId = frameBuffer.readUInt8(3);
				if (!groups.has(groupId)) {
					return [
						addCommandAndLengthToBuffer(GatewayCommand.GW_ERROR_NTF, [GW_ERROR.InvalidSystemTableIndex]),
					];
				}
				const group = groups.get(groupId);
				assertGroupIdShouldExist(group, groupId);

				// Check Group Type and revision
				const revision = frameBuffer.readUInt16BE(100);
				const groupType = frameBuffer.readUInt8(73) as GroupType;
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
					group.Placement = frameBuffer.readUInt8(6);
					group.Name = readZString(frameBuffer.subarray(7, 71));
					group.Velocity = frameBuffer.readUInt8(71);
					group.NodeVariation = frameBuffer.readUInt8(72);
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
				const groupId = frameBuffer.readUInt8(3);
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
				const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				const groupId = frameBuffer.readUInt8(7);
				const parameterId = frameBuffer.readUInt8(8);
				const position = frameBuffer.readUInt16BE(9);
				// const velocity = frameBuffer.readUInt8(11);
				// const priorityLevelLock = frameBuffer.readUInt8(12);
				// const PL = frameBuffer.readUInt16BE(13);
				// const lockTime = frameBuffer.readUInt8(15);

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

			case GatewayCommand.GW_COMMAND_SEND_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				const parameterId = frameBuffer.readUInt8(7);
				const fpi1 = frameBuffer.readUInt8(8);
				const fpi2 = frameBuffer.readUInt8(9);
				const functionalParameters = getFunctionalParamters(fpi1, fpi2);
				const functionalParamtersValues = Array.from(frameBuffer.subarray(10, 10 + 17 * 2));
				const nodeCount = frameBuffer.readUInt8(44);
				const nodes = Array.from(frameBuffer.subarray(45, 45 + nodeCount));
				// const priorityLevelLock = frameBuffer.readUInt8(65);
				// const PL = frameBuffer.readUInt16BE(66);
				// const lockTime = frameBuffer.readUInt8(68);

				if (nodes.some((nodeId) => !products.has(nodeId))) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_SEND_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(0).toBuffer(),
						),
					];
				} else {
					const returnBuffers: Buffer[] = [];
					returnBuffers.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_COMMAND_SEND_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(1).toBuffer(),
						),
					);
					// One GW_COMMAND_RUN_STATUS_NTF for each product in group
					for (const productId of nodes) {
						const product = products.get(productId);
						returnBuffers.push(
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
					for (const productId of nodes) {
						const product = products.get(productId);
						setProductCurrentParameter(product!, 0, functionalParamtersValues[0]);
						for (const fp of functionalParameters) {
							setProductCurrentParameter(product!, fp, functionalParamtersValues[fp]);
						}
						returnBuffers.push(
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
					returnBuffers.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_SESSION_FINISHED_NTF,
							new ArrayBuilder().addInts(sessionId).toBuffer(),
						),
					);

					return returnBuffers;
				}
			}

			case GatewayCommand.GW_WINK_SEND_REQ: {
				const sessionId = frameBuffer.readUInt16BE(3);
				const commandOriginator = frameBuffer.readUInt8(5);
				// const priorityLevel = frameBuffer.readUInt8(6);
				// const winkState = frameBuffer.readUInt8(7);
				// const winkTime = frameBuffer.readUInt8(8);
				const nodeCount = frameBuffer.readUInt8(9);
				const nodes = Array.from(frameBuffer.subarray(10, 10 + nodeCount));

				if (nodes.some((nodeId) => !products.has(nodeId))) {
					return [
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_WINK_SEND_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(0).toBuffer(),
						),
					];
				} else {
					const returnBuffers: Buffer[] = [];
					returnBuffers.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_WINK_SEND_CFM,
							new ArrayBuilder().addInts(sessionId).addBytes(1).toBuffer(),
						),
					);
					// One GW_COMMAND_RUN_STATUS_NTF for each product in group
					for (const productId of nodes) {
						const product = products.get(productId);
						returnBuffers.push(
							addCommandAndLengthToBuffer(
								GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
								new ArrayBuilder()
									.addInts(sessionId)
									.addBytes(commandOriginator, productId, 0)
									.addInts(getProductCurrentParameter(product!, 0))
									.addBytes(2, 1, 0, 0, 0, 0)
									.toBuffer(),
							),
						);
					}

					// Add GW_WINK_SEND_NTF
					returnBuffers.push(
						addCommandAndLengthToBuffer(
							GatewayCommand.GW_WINK_SEND_NTF,
							new ArrayBuilder().addInts(sessionId).toBuffer(),
						),
					);

					return returnBuffers;
				}
			}

			default:
				return [addCommandAndLengthToBuffer(GatewayCommand.GW_ERROR_NTF, [255])];
		}
	}

	function addCommandAndLengthToBuffer(command: GatewayCommand, buffer: ArrayLike<number>): Buffer {
		const resultBuffer = Buffer.alloc(3 + buffer.length);
		resultBuffer.set(buffer, 3);
		resultBuffer.writeUInt16BE(command, 1);
		resultBuffer.writeUInt8(resultBuffer.byteLength, 0);
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

	function getFunctionalParamters(FPI1: number, FPI2: number): number[] {
		const result: number[] = [];
		for (let index = 1; index < 9; index++) {
			if (FPI1 & 0x80) result.push(index);
		}
		for (let index = 9; index < 17; index++) {
			if (FPI2 & 0x80) result.push(index);
		}
		return result;
	}
})();
