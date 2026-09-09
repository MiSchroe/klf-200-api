"use strict";

import * as FakeTimers from "@sinonjs/fake-timers";
import debugModule from "debug";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { after, afterEach, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { TimeoutError } from "promise-timeout";
import { GW_ERROR, GW_GET_STATE_REQ, GW_PASSWORD_ENTER_REQ, GW_SET_UTC_REQ, KLF200SocketProtocol } from "../src";
import { GW_COMMON_STATUS, GatewayCommand } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule(`connection-test`);

const testHOST = "localhost";

describe("connection", { timeout: 20000 }, function () {
	let mockServerController: MockServerController | undefined;

	before(async function () {
		debug("beforeAll");
		mockServerController = await MockServerController.createMockServer();
		debug("beforeAll after mockServerController created");
	});

	after(async function () {
		debug("after");
		if (mockServerController) {
			debug("after before mockServerController disposed");
			await mockServerController[Symbol.asyncDispose]();
			mockServerController = undefined;
			debug("after after mockServerController disposed");
		}
	});

	afterEach(async function () {
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
			await conn.loginAsync("velux123");
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
			await assert.rejects(conn.loginAsync("velux123"), Error);
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
			await assert.rejects(conn.loginAsync("velux123"), Error);
		});

		it.todo("should throw an error after timeout.", async function () {
			const clock = FakeTimers.install({ toFake: ["setTimeout", "clearTimeout"] });
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

					await assert.rejects(loginPromise, TimeoutError);
				} finally {
					conn.KLF200SocketProtocol?.socket?.end();
				}
			} finally {
				clock.uninstall();
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
				assert.strictEqual(conn.KLF200SocketProtocol, undefined);

				// Reset the mock server
				await mockServerController?.sendCommand(ResetCommand);

				await conn.loginAsync("velux123");
				assert.ok(conn.KLF200SocketProtocol instanceof KLF200SocketProtocol);
				assert.strictEqual(conn.KLF200SocketProtocol?.socket.readyState, "open");
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should succeed even when the connection is lost.", async function () {
			const function_under_test = async (): Promise<void> => {
				await using conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				await conn.loginAsync("velux123");
				conn.KLF200SocketProtocol?.socket?.destroy(); // Simulate unexpected closure
				await conn.logoutAsync();
			};
			await function_under_test();
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
			await conn.logoutAsync();
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

			await conn.logoutAsync();
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
			await conn.logoutAsync(); // Call again
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
			await conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
		});

		it.todo("should timeout on missing confirmation.", async function () {
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
				const clock = FakeTimers.install({ toFake: ["setTimeout", "clearTimeout"] });
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
							assert.strictEqual(true, false, "Should not be here.");
						})
						.catch((error) => {
							assert.ok(error instanceof TimeoutError);
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

					await clock.runAllAsync();
					debug("Expect timeout...");
					await sendFramePromise;
					debug("Done.");
				} catch (error) {
					debug(error);
				} finally {
					debug("Restore clock...");
					clock.uninstall();
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
			await assert.rejects(sendFramePromise, Error);
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
			await assert.rejects(() => conn.sendFrameAsync(null as any), Error);
		});

		it("should throw an error when called before login.", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await assert.rejects(async () => conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123")), {
				message: "KLF200SocketProtocol is not initialized. Please login first.",
			});
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
			await conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
		});

		it("should call the notification handler.", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const notificationHandlerSpy = t.mock.fn();
			conn.onFrameSent(notificationHandlerSpy);
			await conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
			assert.strictEqual(notificationHandlerSpy.mock.callCount(), 1);
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
			assert.ok(conn.KLF200SocketProtocol instanceof KLF200SocketProtocol);
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
			assert.ok(conn.KLF200SocketProtocol instanceof KLF200SocketProtocol);
			assert.ok(conn.KLF200SocketProtocol?.socket instanceof net.Socket);
			conn.KLF200SocketProtocol?.socket?.destroy(); // Simulate unexpected closure
			// Reset the mock server
			if (mockServerController) {
				await mockServerController.sendCommand(ResetCommand);
				await mockServerController.sendCommand(CloseConnectionCommand);
			}

			assert.strictEqual(conn.KLF200SocketProtocol, undefined);
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
			assert.ok(conn.KLF200SocketProtocol instanceof KLF200SocketProtocol);
			assert.ok(conn.KLF200SocketProtocol?.socket instanceof net.Socket);
			conn.KLF200SocketProtocol?.socket?.destroy(); // Simulate unexpected closure
			// Reset the mock server
			if (mockServerController) {
				await mockServerController.sendCommand(ResetCommand);
				await mockServerController.sendCommand(CloseConnectionCommand);
			}
			await conn.loginAsync("velux123"); // Reconnect
			assert.ok(conn.KLF200SocketProtocol instanceof KLF200SocketProtocol);
			assert.strictEqual(conn.KLF200SocketProtocol?.socket.readyState, "open");
		});
	});

	describe("on", function () {
		it("should receive a frame in the registered event handler", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = t.mock.fn();
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

			assert.strictEqual(handlerSpy.mock.callCount(), 1);
		});

		it("should receive a frame in the filtered registered event handler on match", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = t.mock.fn();
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

			assert.strictEqual(handlerSpy.mock.callCount(), 1);
		});

		it("shouldn't receive a frame in the filtered registered event handler on no match", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handlerSpy = t.mock.fn();
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

			assert.strictEqual(handlerSpy.mock.callCount(), 0);
		});

		it("should successfully remove a registered handler when disposed", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const handler = t.mock.fn();
			const dispose = conn.on(handler, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
			dispose[Symbol.dispose](); // Remove the handler
			await mockServerController?.sendCommand({
				command: "SendData",
				gatewayCommand: GatewayCommand.GW_PASSWORD_ENTER_CFM,
				data: Buffer.from([GW_COMMON_STATUS.SUCCESS]).toString("base64"),
			});
			assert.strictEqual(handler.mock.callCount(), 0);
		});
	});

	describe("startKeepAlive", function () {
		it.todo("should send a GW_GET_STATE_REQ after 10 minutes", async function (t) {
			const expectedRequest = new GW_GET_STATE_REQ();

			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const sentDataSpy = t.mock.method(conn, "sendFrameAsync");
			const clock = FakeTimers.install({ toFake: ["setInterval", "clearInterval"] });

			try {
				conn.startKeepAlive();

				await clock.tickAsync(10 * 60 * 1000);
			} finally {
				clock.uninstall();
			}

			assert.strictEqual(sentDataSpy.mock.callCount(), 1);
			assert.deepStrictEqual(sentDataSpy.mock.calls[0].arguments, [expectedRequest]);
		});

		it.todo("should postpone the GW_GET_STATE_REQ if other data is sent before 10 minutes", async function (t) {
			const expectedRequest = new GW_GET_STATE_REQ();

			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const sentDataSpy = t.mock.method(conn, "sendFrameAsync");
			const clock = FakeTimers.install({ toFake: ["setInterval", "clearInterval"] });

			try {
				conn.startKeepAlive();

				// Wait 5 minutes
				await clock.tickAsync(5 * 60 * 1000);

				// Send a message in between
				await conn.sendFrameAsync(new GW_SET_UTC_REQ());

				// Wait another 5 minutes
				await clock.tickAsync(5 * 60 * 1000);
			} finally {
				clock.uninstall();
			}

			assert.strictEqual(sentDataSpy.mock.callCount(), 1);
			assert.ok(
				sentDataSpy.mock.calls.every((call) => {
					try {
						assert.deepStrictEqual(call.arguments[0], expectedRequest);
						return false;
					} catch {
						return true;
					}
				}),
			);
		});

		it.todo("should handle multiple calls to startKeepAlive without errors", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			try {
				const sentDataSpy = t.mock.method(conn, "sendFrameAsync");
				const clock = FakeTimers.install({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();
					conn.startKeepAlive(); // Call again

					// Wait 16 minutes
					await clock.tickAsync(16 * 60 * 1000);

					// sendFrameAsync should be called only once
					assert.strictEqual(sentDataSpy.mock.callCount(), 1);
				} finally {
					clock.uninstall();
				}
			} finally {
				conn.stopKeepAlive();
			}
		});
	});

	describe("stopKeepAlive", function () {
		it.todo("shouldn't send a GW_GET_STATE_REQ after 10 minutes after stopping the keep-alive", async function (t) {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			const sentDataSpy = t.mock.method(conn, "sendFrameAsync");
			const clock = FakeTimers.install({ toFake: ["setInterval", "clearInterval"] });

			try {
				conn.startKeepAlive();

				await clock.tickAsync(5 * 60 * 1000);

				conn.stopKeepAlive();

				await clock.tickAsync(5 * 60 * 1000);
			} finally {
				clock.uninstall();
			}

			assert.strictEqual(sentDataSpy.mock.callCount(), 0);
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
			assert.doesNotThrow(() => conn.stopKeepAlive());
		});
	});
});

describe("connection with expired certificate", { timeout: 20000 }, function () {
	let mockServerController: MockServerController | undefined;

	before(async function () {
		debug("before - expired cert");
		mockServerController = await MockServerController.createMockServer(true);
		debug("before - expired cert after mockServerController created");
	});

	after(async function () {
		debug("after - expired cert");
		if (mockServerController) {
			debug("after - expired cert before mockServerController disposed");
			await mockServerController[Symbol.asyncDispose]();
			mockServerController = undefined;
			debug("after - expired cert after mockServerController disposed");
		}
	});

	afterEach(async function () {
		debug("afterEach - expired cert");
		if (mockServerController) {
			debug("afterEach - expired cert before mockServerController sendCommand ResetCommand");
			await mockServerController.sendCommand(ResetCommand);
			debug("afterEach - expired cert before mockServerController sendCommand CloseConnectionCommand");
			await mockServerController.sendCommand(CloseConnectionCommand);
			debug("afterEach - expired cert after mockServerController sendCommand CloseConnectionCommand");
		}
	});

	describe("loginAsync", function () {
		it("should fail when rejectUnauthorized is true", async function () {
			await using conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await assert.rejects(conn.loginAsync("velux123"), Error);
		});

		it("should fail when connecting to the mock server without the correct fingerprint", async function () {
			await using conn = new Connection(testHOST);
			await assert.rejects(
				() => conn.loginAsync("velux123"),
				(err: unknown) => {
					assert.strictEqual(err, "CERT_HAS_EXPIRED");
					return true;
				},
			);
		});

		it("should succeed when connecting to the mock server with the correct fingerprint", async function () {
			await using conn = new Connection(
				testHOST,
				readFileSync(join(__dirname, "mocks/mockServer", "server-crt-outdated.pem")),
				"78:0E:43:3D:ED:C7:59:17:0C:CF:14:9A:DB:D5:5C:1C:BC:7D:17:BB",
			);
			await conn.loginAsync("velux123");
		});
	});
});
