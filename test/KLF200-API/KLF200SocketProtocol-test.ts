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

describe.todo("KLF200-API", function () {
	describe("KLF200SocketProtocol", function () {
		let serverPort: number = 0;
		let server: net.Server;
		before(function (_t, done) {
			// Create a listening echo server, so that
			debug("Starting socket server...");
			server = net.createServer((c) => {
				debug("Client connected.");
				c.on("end", () => {
					debug("Client disconnected.");
				});
				c.setNoDelay();
				c.pipe(c);
			});
			server.listen(() => {
				serverPort = (server.address() as net.AddressInfo).port;
				debug(`Server listens on port ${serverPort}.`);
				done();
			});
		});

		after(function (_t, done) {
			// Tear down the echo server
			if (server) {
				debug("Stopping socket server...");
				server.close(() => {
					debug("Socket server stopped.");
					done();
				});
			} else {
				done();
			}
		});

		let client: net.Socket;
		beforeEach(function (_t, done) {
			// Start socket
			debug("Connecting...");
			client = net.connect(serverPort, undefined, () => {
				client.setNoDelay(); // Write each packet without buffering -> split frames
				done();
			});
		});

		afterEach(function (_t, done) {
			// Stop socket
			debug("Disconnecting...");
			client.end(done);
		});

		it("the socket should echo the request", function (_t, done) {
			client.once("data", (data) => {
				assert.strictEqual(data.toString(), "Test");
				done();
			});
			client.write("Test");
		});

		it("should create without error.", function () {
			assert.doesNotThrow(() => new KLF200SocketProtocol(client));
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check raw data bytes).", function (_t, done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			result.onDataReceived((dataReceived) => {
				try {
					assert.deepStrictEqual(dataReceived, data);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data);
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check resulting frame).", function (_t, done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			result.on((dataReceived) => {
				try {
					assert.ok(dataReceived instanceof GW_PASSWORD_ENTER_CFM);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data);
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check split frame).", function (_t, done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));
			// Split the frame into 3 parts
			const data1 = data.subarray(0, 1);
			const data2 = data.subarray(1, 2);
			const data3 = data.subarray(2);

			const result = new KLF200SocketProtocol(client);
			result.on((dataReceived) => {
				try {
					assert.ok(dataReceived instanceof GW_PASSWORD_ENTER_CFM);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data1, () => client.write(data2, () => client.write(data3)));
		});

		it("should throw an error due to an unknown command ID.", function (_t, done) {
			const dataRaw = Buffer.from([0x04, 0xff, 0xff, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			result.on((_dataReceived) => {
				done(new Error("Due to an unknown command this code shouldn't be reached."));
			});
			result.onError((_error) => {
				done();
			});
			client.write(data);
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
