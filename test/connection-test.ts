"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import debugModule from "debug";
import { readFileSync } from "fs";
import { dirname, join, parse } from "path";
import { TimeoutError } from "promise-timeout";
import sinon from "sinon";
import { fileURLToPath } from "url";
import { GW_ERROR, GW_GET_STATE_REQ, GW_PASSWORD_ENTER_REQ, GW_SET_UTC_REQ, KLF200SocketProtocol } from "../src";
import { GW_COMMON_STATUS, GatewayCommand } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands";
import { MockServerController } from "./mocks/mockServerController";

const debug = debugModule(`${parse(import.meta.filename).name}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

use(chaiAsPromised);

const testHOST = "localhost";

describe("connection", function () {
	this.timeout(10000);

	this.beforeAll(async function () {
		this.mockServerController = await MockServerController.createMockServer();
	});

	this.afterAll(async function () {
		await this.mockServerController[Symbol.asyncDispose]();
	});

	this.afterEach(async function () {
		await this.mockServerController.sendCommand(ResetCommand);
		await this.mockServerController.sendCommand(CloseConnectionCommand);
	});

	describe("loginAsync", function () {
		it("should succeed with correct passowrd.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await expect(conn.loginAsync("velux123")).to.be.fulfilled;
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error with incorrect passowrd.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await (this.mockServerController as MockServerController).sendCommand({
				command: "SetConfirmation",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
				gatewayConfirmation: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
			});
			try {
				await expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error on GW_ERROR_NTF.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await (this.mockServerController as MockServerController).sendCommand({
				command: "SetConfirmation",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
				gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
				data: Buffer.from([GW_ERROR.NotAuthenticated]).toString("base64"),
			});
			try {
				await expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error after timeout.", async function () {
			const clock = sinon.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
			try {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await (this.mockServerController as MockServerController).sendCommand({
						command: "SetFunction",
						gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
						func: `return new Promise((resolve) => {
							resolve([]);
						});`,
					});
					const loginPromise = conn.loginAsync("velux123", 1);

					/*
						A lot of asynchronous stuff and I/O is happing during login.
						The setTimeout function will be called only after several
						loops of the NodeJS event loops have been run.
						We will trigger a new round of the event loop
						by calling setImmediate until we have a waiting mock timer.
						The series of articles at
						https://www.builder.io/blog/visual-guide-to-nodejs-event-loop
						helped me a lot to understand what is going on
						under the hood.
					*/
					const runEventLoopUntilsetTimeoutCalled = (): void => {
						if (clock.countTimers() === 0) {
							setImmediate(runEventLoopUntilsetTimeoutCalled);
						} else {
							debug(`Waiting timers: ${clock.countTimers()}.`);
							clock.runAll();
						}
					};
					setImmediate(runEventLoopUntilsetTimeoutCalled);

					await expect(loginPromise).to.be.rejectedWith(TimeoutError);
				} finally {
					conn.KLF200SocketProtocol?.socket?.end();
				}
			} finally {
				clock.restore();
			}
		});

		it(`should reconnect without error after the connection is lost.`, async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				// Wait-Promise for "close" event
				const closeEventPromise = new Promise((resolve) => {
					conn.KLF200SocketProtocol!.socket.once("close", resolve);
				});

				// Destroy server socket
				await (this.mockServerController as MockServerController).sendCommand(CloseConnectionCommand);

				// Wait for event (if it wasn't synchronous)
				await closeEventPromise;

				// Check, that KLF200Protocol is undefined
				expect(conn.KLF200SocketProtocol).to.be.undefined;

				await expect(conn.loginAsync("velux123")).to.be.fulfilled;
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("logoutAsync", function () {
		it("should fulfill if not logged in.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await expect(conn.logoutAsync()).to.be.fulfilled;
		});

		it("should fulfill if logged in.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");

			await expect(conn.logoutAsync()).to.be.fulfilled;
		});
	});

	describe("sendFrameAsync", function () {
		it("should return the corresponding confirmation.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const p = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
				await expect(p).to.be.fulfilled;
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should timeout on missing confirmation.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});

			try {
				await conn.loginAsync("velux123");
				const clock = sinon.useFakeTimers();
				try {
					await (this.mockServerController as MockServerController).sendCommand({
						command: "SetFunction",
						gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
						func: `return new Promise((resolve) => {
	resolve([]);
});`,
					});
					const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 2);
					clock.runAll();
					await expect(sendFramePromise).to.be.rejectedWith(Error);
				} finally {
					clock.restore();
				}
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should reject on error frame.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.NotAuthenticated]).toString("base64"),
				});
				const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
				await expect(sendFramePromise).to.be.rejectedWith(Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should ignore wrong confirmation.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetFunction",
					gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
					func: `function addCommandAndLengthToBuffer(command, buffer) {
		const resultBuffer = Buffer.alloc(3 + buffer.length);
		resultBuffer.set(buffer, 3);
		resultBuffer.writeUInt16BE(command, 1);
		resultBuffer.writeInt8(resultBuffer.byteLength, 0);
		return resultBuffer;
	}

return new Promise((resolve) => {
	resolve([
		addCommandAndLengthToBuffer(${GatewayCommand.GW_CLEAR_ACTIVATION_LOG_CFM}, []),
		addCommandAndLengthToBuffer(${GatewayCommand.GW_PASSWORD_ENTER_CFM}, [${GW_COMMON_STATUS.SUCCESS}])
	]);
});`,
				});
				const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
				await expect(sendFramePromise).to.be.fulfilled;
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should call the notification handler.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const notificationHandlerSpy = sinon.spy();
				conn.onFrameSent(notificationHandlerSpy);
				const resultSendFrameAsync = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
				await expect(resultSendFrameAsync).to.be.fulfilled;
				expect(notificationHandlerSpy).to.be.calledOnce;
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("KLF200SocketProtocol", function () {
		it("should get the protocol after login.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("on", function () {
		it("should receive a frame in the registered event handler", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const handlerSpy = sinon.spy();
				conn.on(handlerSpy);
				// Send a frame
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SendData",
					gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
					data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
				});

				expect(handlerSpy).to.be.calledOnce;
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should receive a frame in the filtered registered event handler on match", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const handlerSpy = sinon.spy();
				conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
				// Send a frame
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SendData",
					gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
					data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
				});

				expect(handlerSpy).to.be.calledOnce;
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't receive a frame in the filtered registered event handler on no match", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const handlerSpy = sinon.spy();
				conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_CHANGE_CFM]);
				// Send a frame
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SendData",
					gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
					data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
				});

				expect(handlerSpy).not.to.be.called;
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("startKeepAlive", function () {
		it("should send a GW_GET_STATE_REQ after 10 minutes", async function () {
			const expectedRequest = new GW_GET_STATE_REQ();

			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const sentDataSpy = sinon.spy(conn, "sendFrameAsync");
				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					await clock.tickAsync("10:00");
				} finally {
					clock.restore();
				}
				expect(sentDataSpy).to.be.calledOnceWith(expectedRequest);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should postpone the GW_GET_STATE_REQ if other data is sent before 10 minutes", async function () {
			const expectedRequest = new GW_GET_STATE_REQ();

			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const sentDataSpy = sinon.spy(conn, "sendFrameAsync");
				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					// Wait 5 minutes
					await clock.tickAsync("05:00");

					// Send a message in between
					await conn.sendFrameAsync(new GW_SET_UTC_REQ());

					// Wait another 5 minutes
					await clock.tickAsync("05:00");
				} finally {
					clock.restore();
				}
				expect(sentDataSpy).to.be.calledOnce;
				expect(sentDataSpy).not.to.be.calledWith(expectedRequest);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("stopKeepAlive", function () {
		it("shouldn't send a GW_GET_STATE_REQ after 10 minutes after stopping the keep-alive", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const sentDataSpy = sinon.spy(conn, "sendFrameAsync");
				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					await clock.tickAsync("05:00");

					conn.stopKeepAlive();

					await clock.tickAsync("05:00");
				} finally {
					clock.restore();
				}
				expect(sentDataSpy).not.to.be.called;
			} finally {
				await conn.logoutAsync();
			}
		});
	});
});
