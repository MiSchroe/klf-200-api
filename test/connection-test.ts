"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import Mitm from "mitm";
import { Socket } from "net";
import sinon from "sinon";
import { GW_PASSWORD_ENTER_REQ, GW_SET_UTC_REQ, KLF200SocketProtocol } from "../src";
import { GatewayCommand, KLF200Protocol, SLIPProtocol } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";

use(chaiAsPromised);

function rawBufferFrom(data: number[]): Buffer {
	return SLIPProtocol.Encode(KLF200Protocol.Encode(Buffer.concat([Buffer.from([data.length]), Buffer.from(data)])));
}

const testHOST = "velux1234";

describe("connection", function () {
	this.timeout(10000);

	this.beforeEach(function () {
		this.mitm = Mitm();
	});
	this.afterEach(function () {
		this.mitm.disable();
	});

	describe("loginAsync", function () {
		it("should succeed with correct passowrd.", function (done) {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			const conn = new Connection(testHOST);
			expect(conn.loginAsync("velux123")).to.be.fulfilled.and.notify(done);
		});

		it("should throw an error with incorrect passowrd.", function (done) {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x01]));
				});
			});

			const conn = new Connection(testHOST);
			expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should throw an error on GW_ERROR_NTF.", function (done) {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x00, 0x00, 0x0c]));
				});
			});

			const conn = new Connection(testHOST);
			expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should throw an error after timeout.", function (done) {
			const clock = sinon.useFakeTimers();
			try {
				this.mitm.on("connection", function (socket: Socket) {
					socket.on("data", () => {
						setTimeout(function () {
							socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
						}, 2000);
					});
				});

				const conn = new Connection(testHOST);
				const loginPromise = conn.loginAsync("velux123", 1);
				clock.runAll();
				expect(loginPromise).to.be.rejectedWith(Error).and.notify(done);
			} finally {
				clock.restore();
			}
		});

		it(`should reconnect without error after the connection is lost.`, async function () {
			let serverSocket: Socket;
			this.mitm.on("connection", function (socket: Socket) {
				serverSocket = socket;
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			const conn = new Connection(testHOST);
			await conn.loginAsync("velux123");

			// Wait-Promise for "close" event
			const closeEventPromise = new Promise((resolve) => {
				conn.KLF200SocketProtocol!.socket.once("close", resolve);
			});

			// Destroy server socket
			serverSocket!.destroy();

			// Wait for event (if it wasn't synchronous)
			await closeEventPromise;

			// Check, that KLF200Protocol is undefined
			expect(conn.KLF200SocketProtocol).to.be.undefined;

			return expect(conn.loginAsync("velux123")).to.be.fulfilled;
		});
	});

	describe("logoutAsync", function () {
		it("should fulfill if not logged in.", function (done) {
			const conn = new Connection(testHOST);
			expect(conn.logoutAsync()).to.be.fulfilled.and.notify(done);
		});

		it("should fulfill if logged in.", async function () {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			const conn = new Connection(testHOST);
			await conn.loginAsync("velux123");

			return expect(conn.logoutAsync()).to.be.fulfilled;
		});
	});

	describe("sendFrameAsync", function () {
		it("should return the corresponding confirmation.", async function () {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			const conn = new Connection(testHOST);
			try {
				await conn.loginAsync("velux123");
				const p = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
				return expect(p).to.be.fulfilled;
			} catch (reason: any) {
				return Promise.reject(reason);
			}
		});

		it("should timeout on missing confirmation.", async function () {
			let sendData = true;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					if (sendData) {
						socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
					}
				});
			});

			const conn = new Connection(testHOST);

			try {
				await conn.loginAsync("velux123");
				sendData = false;
				const clock = sinon.useFakeTimers();
				try {
					const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
					clock.runAll();
					return expect(sendFramePromise).to.be.rejectedWith(Error);
				} finally {
					clock.restore();
				}
			} catch (reason: any) {
				return Promise.reject(reason);
			}
		});

		it("should reject on error frame.", async function () {
			let isFirstData = true;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					if (isFirstData) {
						socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
						isFirstData = false;
					} else {
						socket.write(rawBufferFrom([0x00, 0x00, 0x07]));
					}
				});
			});

			const conn = new Connection(testHOST);
			try {
				await conn.loginAsync("velux123");
				const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
				return expect(sendFramePromise).to.be.rejectedWith(Error);
			} catch (reason: any) {
				return Promise.reject(reason);
			}
		});

		it("should ignore wrong confirmation.", async function () {
			let isFirstData = true;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					if (isFirstData) {
						socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
						isFirstData = false;
					} else {
						socket.write(rawBufferFrom([0x05, 0x03]));
						socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
					}
				});
			});

			const conn = new Connection(testHOST);
			try {
				await conn.loginAsync("velux123");
				const sendFramePromise = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1000);
				return expect(sendFramePromise).to.be.fulfilled;
			} catch (reason: any) {
				return Promise.reject(reason);
			}
		});

		it("should call the notification handler.", function (done) {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			const conn = new Connection(testHOST);
			conn.loginAsync("velux123")
				.then(async () => {
					const notificationHandlerSpy = sinon.spy();
					conn.onFrameSent(notificationHandlerSpy);
					const resultSendFrameAsync = conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"));
					await resultSendFrameAsync;
					expect(notificationHandlerSpy).to.be.calledOnce;
					expect(resultSendFrameAsync).to.be.fulfilled.and.notify(done);
				})
				.catch((reason: any) => expect.fail(reason));
		});
	});

	describe("KLF200SocketProtocol", function () {
		it("should get the protocol after login.", async function () {
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");
				return Promise.resolve(expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol));
			} catch (error) {
				return Promise.reject(error);
			}
		});
	});

	describe("on", function () {
		it("should receive a frame in the registered event handler", async function () {
			let s: Socket | undefined;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
				s = socket; // Use outside
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const handlerSpy = sinon.spy();
				conn.on(handlerSpy);
				// Send a frame
				(s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
				// Just let the asynchronous stuff run before our checks
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});

				return Promise.resolve(expect(handlerSpy).to.be.calledOnce);
			} catch (error) {
				return Promise.reject(error);
			}
		});

		it("should receive a frame in the filtered registered event handler on match", async function () {
			let s: Socket | undefined;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
				s = socket; // Use outside
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const handlerSpy = sinon.spy();
				conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
				// Send a frame
				(s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
				// Just let the asynchronous stuff run before our checks
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});

				return Promise.resolve(expect(handlerSpy).to.be.calledOnce);
			} catch (error) {
				return Promise.reject(error);
			}
		});

		it("shouldn't receive a frame in the filtered registered event handler on no match", async function () {
			let s: Socket | undefined;
			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", () => {
					socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
				});
				s = socket; // Use outside
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const handlerSpy = sinon.spy();
				conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_CHANGE_CFM]);
				// Send a frame
				(s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
				// Just let the asynchronous stuff run before our checks
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});

				return Promise.resolve(expect(handlerSpy).not.to.be.called);
			} catch (error) {
				return Promise.reject(error);
			}
		});
	});

	describe("startKeepAlive", function () {
		this.beforeEach(function () {
			// this.clock = sinon.useFakeTimers();
		});

		this.afterEach(function () {
			// (this.clock as SinonFakeTimers).restore();
		});

		it("should send a GW_GET_STATE_REQ after 10 minutes", async function () {
			const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

			const dataStub = sinon
				.stub<any, Buffer>()
				.onFirstCall()
				.returns(rawBufferFrom([0x30, 0x01, 0x00]))
				.onSecondCall()
				.returns(rawBufferFrom([0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]));

			const sentDataSpy = sinon.spy();

			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", (d) => {
					sentDataSpy([...d.values()]);
					socket.write(dataStub());
				});
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					clock.tick("10:00");

					// Wait for asynchronous operation
					await new Promise((resolve) => setTimeout(resolve, 0));

					expect(sentDataSpy).to.be.calledTwice;
					expect(sentDataSpy).to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

					return Promise.resolve();
				} finally {
					clock.restore();
				}
			} catch (error) {
				return Promise.reject(error);
			}
		});

		it("should postpone the GW_GET_STATE_REQ if other data is sent before 10 minutes", async function () {
			const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

			const dataStub = sinon
				.stub<any, Buffer>()
				.onFirstCall()
				.returns(rawBufferFrom([0x30, 0x01, 0x00]))
				.onSecondCall()
				.returns(rawBufferFrom([0x20, 0x01]))
				.onThirdCall()
				.returns(rawBufferFrom([0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]));

			const sentDataSpy = sinon.spy();

			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", (d) => {
					sentDataSpy([...d.values()]);
					socket.write(dataStub());
				});
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					// Wait 5 minutes
					clock.tick("05:00");

					// Send a message in between
					await conn.sendFrameAsync(new GW_SET_UTC_REQ());

					// // Wait for asynchronous operation
					// await new Promise(resolve => setTimeout(resolve, 0));

					// Wait another 5 minutes
					clock.tick("05:00");

					// Wait for asynchronous operation
					await new Promise((resolve) => setTimeout(resolve, 0));

					expect(sentDataSpy).to.be.calledTwice;
					expect(sentDataSpy).not.to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

					return Promise.resolve();
				} finally {
					clock.restore();
				}
			} catch (error) {
				return Promise.reject(error);
			}
		});
	});

	describe("stopKeepAlive", function () {
		it("shouldn't send a GW_GET_STATE_REQ after 10 minutes after stopping the keep-alive", async function () {
			const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

			const dataStub = sinon
				.stub<any, Buffer>()
				.onFirstCall()
				.returns(rawBufferFrom([0x30, 0x01, 0x00]))
				.onSecondCall()
				.returns(rawBufferFrom([0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]));

			const sentDataSpy = sinon.spy();

			this.mitm.on("connection", function (socket: Socket) {
				socket.on("data", (d) => {
					sentDataSpy([...d.values()]);
					socket.write(dataStub());
				});
			});

			try {
				const conn = new Connection(testHOST);
				await conn.loginAsync("velux123");

				const clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

				try {
					conn.startKeepAlive();

					clock.tick("05:00");

					conn.stopKeepAlive();

					clock.tick("05:00");

					// Wait for asynchronous operation
					await new Promise((resolve) => setTimeout(resolve, 0));

					expect(sentDataSpy).to.be.calledOnce;
					expect(sentDataSpy).not.to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

					return Promise.resolve();
				} finally {
					clock.restore();
				}
			} catch (error) {
				return Promise.reject(error);
			}
		});
	});
});
