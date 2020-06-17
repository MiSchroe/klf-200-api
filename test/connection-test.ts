"use strict";

import Mitm from "mitm";
import { Socket } from "net";
import { SLIPProtocol, KLF200Protocol, GatewayCommand } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { GW_PASSWORD_ENTER_REQ, KLF200SocketProtocol, GW_GET_STATE_REQ, GW_GET_STATE_CFM, GW_SET_UTC_REQ } from "../src";
import sinon, { SinonFakeTimers } from "sinon";
import { install } from "lolex";

use(chaiAsPromised);

function rawBufferFrom(data: number[]): Buffer {
    return SLIPProtocol.Encode(KLF200Protocol.Encode(Buffer.concat([Buffer.from([data.length]), Buffer.from(data)])));
}

const testHOST = 'velux1234';

describe("connection", function () {
    this.timeout(10000);

    let mitmInstance: any;

    this.beforeEach(function() { mitmInstance = Mitm(); });
    this.afterEach(function() { mitmInstance.disable(); });

    describe("loginAsync", function() {
        it("should succeed with correct passowrd.", function(done) {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.fulfilled.and.notify(done);
        });

        it("should throw an error with incorrect passowrd.", function(done) {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x01]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
        });

        it("should throw an error on GW_ERROR_NTF.", function(done) {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x00, 0x00, 0x0c]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
        });

        it("should throw an error after timeout.", function(done) {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    setTimeout(function() {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    }, 2000);
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123", 1)).to.be.rejectedWith(Error).and.notify(done);
        });

        it(`should reconnect without error after the connection is lost.`, async function() {
            this.slow(200);
            let isFirstConnect = true;
            mitmInstance.on("connection", function(socket: Socket) {
                console.log('1');
                socket.on("data", () => {
                    console.log('2');
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    if (isFirstConnect) {
                        isFirstConnect = false;
                        // Close the socket
                        socket.destroy();
                    }
                });
            });

            const conn = new Connection(testHOST);
            await conn.loginAsync("velux123");

            console.log('3');
            // Wait for the close event of the socket to be emitted
            await new Promise((resolve) => {
                setTimeout(resolve, 0);
            });

            console.log('4');
            // Check, that KLF200Protocol is undefined
            expect(conn.KLF200SocketProtocol).to.be.undefined;

            console.log('5');
            // Reset mitm
            mitmInstance.disable();
            mitmInstance = Mitm();
            mitmInstance.on("connection", function(socket: Socket) {
                console.log('6');
                socket.on("data", () => {
                    console.log('7');
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    if (isFirstConnect) {
                        isFirstConnect = false;
                        // Close the socket
                        socket.destroy();
                    }
                });
            });

            console.log('8');
            await expect(conn.loginAsync("velux123")).to.be.fulfilled;
            console.log('9');
        });
    });

    describe("logoutAsync", function() {
        it("should fulfill if not logged in.", function(done) {
            const conn = new Connection(testHOST);
            expect(conn.logoutAsync()).to.be.fulfilled.and.notify(done);
        });

        it("should fulfill if logged in.", async function() {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            await conn.loginAsync("velux123");

            return expect(conn.logoutAsync()).to.be.fulfilled;
        });
    });

    describe("sendFrameAsync", function() {
        it("should return the corresponding confirmation.", function(done) {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            conn.loginAsync("velux123")
            .then(() =>
                expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"))).to.be.fulfilled.and.notify(done)
            );
        });

        it("should timeout on missing confirmation.", function(done) {
            this.timeout(2000);
            let isFirstData = true;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    if (isFirstData) {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                        isFirstData = false;
                    }
                });
            });

            const conn = new Connection(testHOST);
            conn.loginAsync("velux123")
            .then(() =>
                expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.be.rejectedWith(Error).and.notify(done)
            );
        });

        it("should reject on error frame.", function(done) {
            this.timeout(2000);
            let isFirstData = true;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    if (isFirstData) {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                        isFirstData = false;
                    }
                    else {
                        socket.write(rawBufferFrom([0x00, 0x00, 0x07]));
                    }
                });
            });

            const conn = new Connection(testHOST);
            conn.loginAsync("velux123")
            .then(() =>
                expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.be.rejectedWith(Error).and.notify(done)
            );
        });

        it("should ignore wrong confirmation.", function(done) {
            this.timeout(2000);
            let isFirstData = true;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    if (isFirstData) {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                        isFirstData = false;
                    }
                    else {
                        socket.write(rawBufferFrom([0x05, 0x03]));
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    }
                });
            });

            const conn = new Connection(testHOST);
            conn.loginAsync("velux123")
            .then(() =>
                expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.be.fulfilled.and.notify(done)
            );
        });
    });

    describe("KLF200SocketProtocol", function() {
        it("should get the protocol after login.", async function() {
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");
                return Promise.resolve(expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol));
            } catch(error) {
                return Promise.reject(error);
            }
        });
    });

    describe("on", function() {
        it("should receive a frame in the registered event handler", async function() {
            let s: Socket | undefined;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
                s = socket; // Use outside
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");
                
                const handlerSpy = sinon.spy();
                conn.on(handlerSpy);
                // Send a frame
                (s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                return Promise.resolve(expect(handlerSpy).to.be.calledOnce);
            } catch(error) {
                return Promise.reject(error);
            }
        });

        it("should receive a frame in the filtered registered event handler on match", async function() {
            let s: Socket | undefined;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
                s = socket; // Use outside
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");
                
                const handlerSpy = sinon.spy();
                conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_ENTER_CFM]);
                // Send a frame
                (s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                return Promise.resolve(expect(handlerSpy).to.be.calledOnce);
            } catch(error) {
                return Promise.reject(error);
            }
        });

        it("shouldn't receive a frame in the filtered registered event handler on no match", async function() {
            let s: Socket | undefined;
            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
                s = socket; // Use outside
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");
                
                const handlerSpy = sinon.spy();
                conn.on(handlerSpy, [GatewayCommand.GW_PASSWORD_CHANGE_CFM]);
                // Send a frame
                (s as Socket).write(rawBufferFrom([0x30, 0x01, 0x00]));
                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                return Promise.resolve(expect(handlerSpy).not.to.be.called);
            } catch(error) {
                return Promise.reject(error);
            }
        });
    });

    describe("startKeepAlive", function() {
        this.beforeEach(function() {
            // this.clock = sinon.useFakeTimers();
        });

        this.afterEach(function() {
            // (this.clock as SinonFakeTimers).restore();
        });

        it("should send a GW_GET_STATE_REQ after 10 minutes", async function() {
            const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

            const dataStub = sinon.stub<any, Buffer>()
                .onFirstCall().returns(rawBufferFrom([0x30, 0x01, 0x00]))
                .onSecondCall().returns(rawBufferFrom([0x00, 0x0D, 2, 0x80, 0, 0, 0, 0]));

            const sentDataSpy = sinon.spy();

            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", (d) => {
                    sentDataSpy([...d.values()]);
                    socket.write(dataStub());
                });
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");

                const clock = sinon.useFakeTimers({toFake: ["setInterval", "clearInterval"]});

                try {
                    conn.startKeepAlive();

                    clock.tick("10:00");

                    // Wait for asynchronous operation
                    await new Promise(resolve => setTimeout(resolve, 0));

                    expect(sentDataSpy).to.be.calledTwice;
                    expect(sentDataSpy).to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

                    return Promise.resolve();
                } finally {
                    clock.restore();
                }
            } catch(error) {
                return Promise.reject(error);
            }
        });

        it("should postpone the GW_GET_STATE_REQ if other data is sent before 10 minutes", async function() {
            const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

            const dataStub = sinon.stub<any, Buffer>()
                .onFirstCall().returns(rawBufferFrom([0x30, 0x01, 0x00]))
                .onSecondCall().returns(rawBufferFrom([0x20, 0x01]))
                .onThirdCall().returns(rawBufferFrom([0x00, 0x0D, 2, 0x80, 0, 0, 0, 0]));

            const sentDataSpy = sinon.spy();

            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", (d) => {
                    sentDataSpy([...d.values()]);
                    socket.write(dataStub());
                });
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");

                const clock = sinon.useFakeTimers({toFake: ["setInterval", "clearInterval"]});

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
                    await new Promise(resolve => setTimeout(resolve, 0));

                    expect(sentDataSpy).to.be.calledTwice;
                    expect(sentDataSpy).not.to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

                    return Promise.resolve();
                } finally {
                    clock.restore();
                }
            } catch(error) {
                return Promise.reject(error);
            }
        });
    });

    describe("stopKeepAlive", function() {
        this.beforeEach(function() {
            // this.clock = sinon.useFakeTimers();
        });

        this.afterEach(function() {
            // (this.clock as SinonFakeTimers).restore();
        });

        it("shouldn't send a GW_GET_STATE_REQ after 10 minutes after stopping the keep-alive", async function() {
            const expectedRequest = [192, 0, 3, 0, 12, 15, 192];

            const dataStub = sinon.stub<any, Buffer>()
                .onFirstCall().returns(rawBufferFrom([0x30, 0x01, 0x00]))
                .onSecondCall().returns(rawBufferFrom([0x00, 0x0D, 2, 0x80, 0, 0, 0, 0]));

            const sentDataSpy = sinon.spy();

            mitmInstance.on("connection", function(socket: Socket) {
                socket.on("data", (d) => {
                    sentDataSpy([...d.values()]);
                    socket.write(dataStub());
                });
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");

                const clock = sinon.useFakeTimers({toFake: ["setInterval", "clearInterval"]});

                try {
                    conn.startKeepAlive();

                    clock.tick("05:00");

                    conn.stopKeepAlive();

                    clock.tick("05:00");

                    // Wait for asynchronous operation
                    await new Promise(resolve => setTimeout(resolve, 0));

                    expect(sentDataSpy).to.be.calledOnce;
                    expect(sentDataSpy).not.to.be.calledWith(sinon.match.array.deepEquals(expectedRequest));

                    return Promise.resolve();
                } finally {
                    clock.restore();
                }
            } catch(error) {
                return Promise.reject(error);
            }
        });
    });
});
