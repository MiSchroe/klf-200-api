"use strict";

import debugModule from "debug";
import assert from "node:assert/strict";
import * as net from "node:net";
import path from "node:path";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { GW_PASSWORD_ENTER_CFM, KLF200Protocol, KLF200SocketProtocol, SLIPProtocol } from "../../src";

const __filename = fileURLToPath(import.meta.url);

const debug = debugModule(path.parse(__filename).name);

describe("KLF200-API", function () {
	describe("KLF200SocketProtocol", function () {
		let serverPort: number = 0;
		let server: net.Server;
		before(async function () {
			// Create a listening echo server
			debug("Starting socket server...");
			await new Promise<void>((resolve, reject) => {
				const errHandler = (err: Error): void => {
					debug(`Server error: ${err.message}`);
					reject(err);
				};
				let off: () => void;
				server = net.createServer((c) => {
					debug("Client connected.");
					c.on("end", () => {
						debug("Client disconnected.");
					});
					c.once("error", errHandler);
					off = () => c.off("error", errHandler);
					c.setNoDelay();
					c.pipe(c);
				});

				server.listen(() => {
					serverPort = (server.address() as net.AddressInfo).port;
					debug(`Server listens on port ${serverPort}.`);
					// Remove the error handler once the server is successfully listening
					if (off) off();
					resolve();
				});
			});
		});

		after(async function () {
			// Tear down the echo server
			await new Promise<void>((resolve) => {
				if (server) {
					debug("Stopping socket server...");
					server.close(() => {
						debug("Socket server stopped.");
						resolve();
					});
				} else {
					resolve();
				}
			});
		});

		let client: net.Socket;
		beforeEach(async function () {
			// Start socket
			await new Promise<void>((resolve) => {
				debug("Connecting...");
				client = net.connect(serverPort, undefined, () => {
					client.setNoDelay(); // Write each packet without buffering -> split frames
					resolve();
				});
			});
		});

		afterEach(async function () {
			// Stop socket
			debug("Disconnecting...");
			await new Promise<void>((resolve) => client.end(resolve));
		});

		it("the socket should echo the request", async function () {
			await new Promise<void>((resolve) => {
				client.once("data", (data) => {
					assert.strictEqual(data.toString(), "Test");
					resolve();
				});
				client.write("Test");
			});
		});

		it("should create without error.", function () {
			assert.doesNotThrow(() => new KLF200SocketProtocol(client));
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check raw data bytes).", async function () {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			await new Promise<void>((resolve, reject) => {
				result.onDataReceived((dataReceived) => {
					try {
						assert.deepStrictEqual(dataReceived, data);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
				client.write(data);
			});
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check resulting frame).", async function () {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			await new Promise<void>((resolve, reject) => {
				result.on((dataReceived) => {
					try {
						assert.ok(dataReceived instanceof GW_PASSWORD_ENTER_CFM);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
				client.write(data);
			});
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check split frame).", async function () {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));
			// Split the frame into 3 parts
			const data1 = data.subarray(0, 1);
			const data2 = data.subarray(1, 2);
			const data3 = data.subarray(2);

			const result = new KLF200SocketProtocol(client);
			await new Promise<void>((resolve, reject) => {
				result.on((dataReceived) => {
					try {
						assert.ok(dataReceived instanceof GW_PASSWORD_ENTER_CFM);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
				client.write(data1, () => client.write(data2, () => client.write(data3)));
			});
		});

		it("should throw an error due to an unknown command ID.", async function () {
			const dataRaw = Buffer.from([0x04, 0xff, 0xff, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			await new Promise<void>((resolve, reject) => {
				result.on((_dataReceived) => {
					reject(new Error("Due to an unknown command this code shouldn't be reached."));
				});
				result.onError((_error) => {
					resolve();
				});
				client.write(data);
			});
		});

		it("should write the data using the protocol.", async function () {
			const data = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const expectedData = SLIPProtocol.Encode(KLF200Protocol.Encode(data));

			const result = new KLF200SocketProtocol(client);
			const resultPromise = new Promise<void>((resolve, reject) => {
				result.onDataReceived((dataReceived) => {
					try {
						assert.deepStrictEqual(dataReceived, expectedData);
						resolve();
					} catch (error) {
						reject(error as Error);
					}
				});
				result.onError((error) => {
					reject(error);
				});
			});
			await result.write(data);
			await resultPromise;
		});
	});
});
