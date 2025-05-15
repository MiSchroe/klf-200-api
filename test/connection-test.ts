"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import debugModule from "debug";
import { readFileSync } from "fs";
import net from "net";
import { dirname, join } from "path";
import { TimeoutError } from "promise-timeout";
import sinon from "sinon";
import { fileURLToPath } from "url";
import { GW_ERROR, GW_GET_STATE_REQ, GW_PASSWORD_ENTER_REQ, GW_SET_UTC_REQ, KLF200SocketProtocol } from "../src";
import { GW_COMMON_STATUS, GatewayCommand } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule(`connection-test`);

use(chaiAsPromised);

const testHOST = "localhost";

describe("connection", function () {
	this.timeout(20000);

	let mockServerController: MockServerController | undefined;

	this.beforeAll(async function () {
		debug("beforeAll");
		mockServerController = await MockServerController.createMockServer();
		debug("beforeAll after mockServerController created");
	});

	this.afterAll(async function () {
		debug("afterAll");
		if (mockServerController) {
			debug("afterAll before mockServerController disposed");
			await mockServerController[Symbol.asyncDispose]();
			mockServerController = undefined;
			debug("afterAll after mockServerController disposed");
		}
	});

	this.afterEach(async function () {
		debug("afterEach");
		if (mockServerController) {
			debug("afterEach before mockServerController sendCommand ResetCommand");
			await mockServerController.sendCommand(ResetCommand);
			debug("afterEach before mockServerController sendCommand CloseConnectionCommand");
			await mockServerController.sendCommand(CloseConnectionCommand);
			debug("afterEach after mockServerController sendCommand CloseConnectionCommand");
		}
	});

	describe("loginAsync", function () {
		it("should succeed with correct passowrd.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await expect(conn.loginAsync("velux123")).to.be.fulfilled;
		});

		it("should throw an error with incorrect passowrd.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await mockServerController?.sendCommand({
				command: "SetConfirmation",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
				gatewayConfirmation: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
			});
			await expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error);
		});

		it("should throw an error on GW_ERROR_NTF.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await mockServerController?.sendCommand({
				command: "SetConfirmation",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
				gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
				data: Buffer.from([GW_ERROR.NotAuthenticated]).toString("base64"),
			});
			await expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error);
		});

		it("should throw an error after timeout.", async function () {
			const clock = sinon.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
			try {
				await using conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await mockServerController?.sendCommand({
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
			await using conn = new Connection(testHOST, {
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
				await mockServerController?.sendCommand(CloseConnectionCommand);

				// Wait for event (if it wasn't synchronous)
				await closeEventPromise;

				// Check, that KLF200Protocol is undefined
				expect(conn.KLF200SocketProtocol).to.be.undefined;

				await expect(conn.loginAsync("velux123")).to.be.fulfilled;
				expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
				expect(conn.KLF200SocketProtocol?.socket.readyState).to.equal("open");
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("logoutAsync", function () {
		it("should fulfill if not logged in.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await expect(conn.logoutAsync()).to.be.fulfilled;
		});

		it("should fulfill if logged in.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");

			await expect(conn.logoutAsync()).to.be.fulfilled;
		});

		it("should handle multiple calls to logoutAsync gracefully", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			await conn.logoutAsync();
			await expect(conn.logoutAsync()).to.be.fulfilled; // Call again
		});
	});

	describe("sendFrameAsync", function () {
		it("should return the corresponding confirmation.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const p = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
			await expect(p).to.be.fulfilled;
		});

		it("should timeout on missing confirmation.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});

			try {
				debug("Login...");
				await conn.loginAsync("velux123");
				debug("Send command...");
				const clock = sinon.useFakeTimers();
				try {
					await mockServerController?.sendCommand({
						command: "SetFunction",
						gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
						func: `return Promise.resolve([]);`,
					});
					debug("Send frame...");

					/*
						Usually, we would just expect the promise to be rejected.
						Unfortunately, with the fake timers this would lead to a
						PromiseRejectionHandledWarning from NodeJS.
						To circumvent this, we will add a .then handler that
						shouldn't be reached and an additional .catch handler
						that should be called.
					*/
					const sendFramePromise = conn
						.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 2)
						.then(() => {
							expect(true, "Should not be here.").to.be.false;
						})
						.catch((error) => {
							expect(error).to.be.instanceOf(TimeoutError);
						});
					debug("Wait for timeout...");

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
					debug(`Current number of timers: ${clock.countTimers()}.`);

					await clock.runAllAsync();
					debug("Expect timeout...");
					await expect(sendFramePromise).to.be.fulfilled;
					debug("Done.");
				} catch (error) {
					debug(error);
				} finally {
					debug("Restore clock...");
					clock.restore();
					debug("Done after restore clock.");
				}
			} catch (error) {
				debug(error);
			} finally {
				debug("Logout...");
				await conn.logoutAsync();
				debug("Done after logout.");
			}
		});

		it("should reject on error frame.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			await mockServerController?.sendCommand({
				command: "SetConfirmation",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_REQ,
				gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
				data: Buffer.from([GW_ERROR.NotAuthenticated]).toString("base64"),
			});
			const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
			await expect(sendFramePromise).to.be.rejectedWith(Error);
		});

		it("should throw an error when called with null", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			await expect(conn.sendFrameAsync(null as any)).to.be.rejectedWith(Error);
		});

		it("should ignore wrong confirmation.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			await mockServerController?.sendCommand({
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
		});

		it("should call the notification handler.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const notificationHandlerSpy = sinon.spy();
			conn.onFrameSent(notificationHandlerSpy);
			const resultSendFrameAsync = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
			await expect(resultSendFrameAsync).to.be.fulfilled;
			expect(notificationHandlerSpy).to.be.calledOnce;
		});
	});

	describe("KLF200SocketProtocol", function () {
		it("should get the protocol after login.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
		});

		it("should handle unexpected protocol closure gracefully", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
			expect(conn.KLF200SocketProtocol?.socket).to.be.instanceOf(net.Socket);
			conn.KLF200SocketProtocol?.socket?.destroy(); // Simulate unexpected closure
			// Reset the mock server
			if (mockServerController) {
				await mockServerController.sendCommand(ResetCommand);
				await mockServerController.sendCommand(CloseConnectionCommand);
			}

			expect(conn.KLF200SocketProtocol).to.be.undefined;
		});

		it("should reconnect after protocol is unavailable", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
			expect(conn.KLF200SocketProtocol?.socket).to.be.instanceOf(net.Socket);
			conn.KLF200SocketProtocol?.socket?.destroy(); // Simulate unexpected closure
			// Reset the mock server
			if (mockServerController) {
				await mockServerController.sendCommand(ResetCommand);
				await mockServerController.sendCommand(CloseConnectionCommand);
			}
			await expect(conn.loginAsync("velux123")).to.be.fulfilled; // Reconnect
			expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol);
			expect(conn.KLF200SocketProtocol?.socket.readyState).to.equal("open");
		});
	});

	describe("on", function () {
		it("should receive a frame in the registered event handler", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = sinon.spy();
			conn.on(handlerSpy);
			// Send a frame
			const waitPromise = new Promise((resolve) => {
				conn.on(resolve, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			});
			await mockServerController?.sendCommand({
				command: "SendData",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
			});

			// Let the asynchronous stuff run and give the notification some time
			await waitPromise;

			expect(handlerSpy).to.be.calledOnce;
		});

		it("should receive a frame in the filtered registered event handler on match", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = sinon.spy();
			conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			// Send a frame
			const waitPromise = new Promise((resolve) => {
				conn.on(resolve, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			});
			await mockServerController?.sendCommand({
				command: "SendData",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
			});

			// Let the asynchronous stuff run and give the notification some time
			await waitPromise;

			expect(handlerSpy).to.be.calledOnce;
		});

		it("shouldn't receive a frame in the filtered registered event handler on no match", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = sinon.spy();
			conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_CHANGE_CFM]);
			// Send a frame
			const waitPromise = new Promise((resolve) => {
				conn.on(resolve, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			});
			await mockServerController?.sendCommand({
				command: "SendData",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
			});

			// Let the asynchronous stuff run and give the notification some time
			await waitPromise;

			expect(handlerSpy).not.to.be.called;
		});

		it("should successfully remove a registered handler when disposed", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handler = sinon.spy();
			const dispose = conn.on(handler, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			dispose[Symbol.dispose](); // Remove the handler
			await mockServerController?.sendCommand({
				command: "SendData",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
			});
			expect(handler).not.to.be.called;
		});
	});

	describe("startKeepAlive", function () {
		it("should send a GW_GET_STATE_REQ after 10 minutes", async function () {
			const expectedRequest = new GW_GET_STATE_REQ();

			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const sentDataSpy = sinon.spy(conn, "sendFrameAsync");
			const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

			try {
				conn.startKeepAlive();

				await clock.tickAsync("10:00");
			} finally {
				clock.restore();
			}
			expect(sentDataSpy).to.be.calledOnceWith(expectedRequest);
		});

		it("should postpone the GW_GET_STATE_REQ if other data is sent before 10 minutes", async function () {
			const expectedRequest = new GW_GET_STATE_REQ();

			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
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
		});

		it("should handle multiple calls to startKeepAlive without errors", async function () {
			await using conn = new Connection(testHOST, {
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
					conn.startKeepAlive(); // Call again

					// Wait 16 minutes
					await clock.tickAsync("16:00");

					// sendFrameAsync should be called only once
					expect(sentDataSpy).to.be.calledOnce;
				} finally {
					clock.restore();
				}
			} finally {
				conn.stopKeepAlive();
			}
		});
	});

	describe("stopKeepAlive", function () {
		it("shouldn't send a GW_GET_STATE_REQ after 10 minutes after stopping the keep-alive", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
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
		});

		it("should handle stopKeepAlive without startKeepAlive", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			expect(conn.stopKeepAlive).not.to.throw;
		});
	});
});
