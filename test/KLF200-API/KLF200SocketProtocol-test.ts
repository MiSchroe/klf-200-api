"use strict";

import { expect, use } from "chai";
import chaibytes from "chai-bytes";
import debugModule from "debug";
import "mocha";
import * as net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { GW_PASSWORD_ENTER_CFM, KLF200Protocol, KLF200SocketProtocol, SLIPProtocol } from "../../src";

const __filename = fileURLToPath(import.meta.url);

const debug = debugModule(path.parse(__filename).name);

use(chaibytes);

describe("KLF200-API", function () {
	describe("KLF200SocketProtocol", function () {
		let serverPort: number = 0;
		let server: net.Server;
		before(function (done) {
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

		after(function (done) {
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
		this.beforeEach(function (done) {
			// Start socket
			debug("Connecting...");
			client = net.connect(serverPort, undefined, () => {
				client.setNoDelay(); // Write each packet without buffering -> split frames
				done();
			});
		});

		this.afterEach(function (done) {
			// Stop socket
			debug("Disconnecting...");
			client.end(done);
		});

		it("the socket should echo the request", function (done) {
			client.once("data", (data) => {
				expect(data.toString()).to.be.equal("Test");
				done();
			});
			client.write("Test");
		});

		it("should create without error.", function () {
			expect(() => new KLF200SocketProtocol(client)).not.to.throw();
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check raw data bytes).", function (done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			result.onDataReceived((dataReceived) => {
				try {
					expect(dataReceived).to.equalBytes(data);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data);
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check resulting frame).", function (done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));

			const result = new KLF200SocketProtocol(client);
			result.on((dataReceived) => {
				try {
					expect(dataReceived).to.be.instanceOf(GW_PASSWORD_ENTER_CFM);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data);
		});

		it("should find GW_PASSWORD_ENTER_CFM frame (check split frame).", function (done) {
			const dataRaw = Buffer.from([0x04, 0x30, 0x01, 0x00]);
			const data = SLIPProtocol.Encode(KLF200Protocol.Encode(dataRaw));
			// Split the frame into 3 parts
			const data1 = data.subarray(0, 1);
			const data2 = data.subarray(1, 2);
			const data3 = data.subarray(2);

			const result = new KLF200SocketProtocol(client);
			result.on((dataReceived) => {
				try {
					expect(dataReceived).to.be.instanceOf(GW_PASSWORD_ENTER_CFM);
					done();
				} catch (error) {
					done(error);
				}
			});
			client.write(data1, () => client.write(data2, () => client.write(data3)));
		});

		it("should throw an error due to an unknown command ID.", function (done) {
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
						expect(dataReceived).to.be.equalBytes(expectedData);
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
