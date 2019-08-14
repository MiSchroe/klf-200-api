"use strict";

import Mitm from "mitm";
import { Socket } from "net";
import { SLIPProtocol, KLF200Protocol } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { GW_PASSWORD_ENTER_REQ, KLF200SocketProtocol } from "../src";

use(chaiAsPromised);

function rawBufferFrom(data: number[]): Buffer {
    return SLIPProtocol.Encode(KLF200Protocol.Encode(Buffer.concat([Buffer.from([data.length]), Buffer.from(data)])));
}

const testHOST = 'velux1234';

describe("connection", function () {
    this.timeout(10000);
    this.beforeEach(function() { this.mitm = Mitm(); });
    this.afterEach(function() { this.mitm.disable(); });

    describe("loginAsync", function() {
        it("should succeed with correct passowrd.", function(done) {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.fulfilled.and.notify(done);
        });

        it("should throw an error with incorrect passowrd.", function(done) {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x01]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
        });

        it("should throw an error on GW_ERROR_NTF.", function(done) {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x00, 0x00, 0x0c]));
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123")).to.be.rejectedWith(Error).and.notify(done);
        });

        it("should throw an error after timeout.", function(done) {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    setTimeout(function() {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    }, 2000);
                });
            });

            const conn = new Connection(testHOST);
            expect(conn.loginAsync("velux123", 1)).to.be.rejectedWith(Error).and.notify(done);
        });
    });

    describe("logoutAsync", function() {
        it("should fulfill if not logged in.", function(done) {
            const conn = new Connection(testHOST);
            expect(conn.logoutAsync()).to.be.fulfilled.and.notify(done);
        });

        it.skip("should fulfill if logged in.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
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
            this.mitm.on("connection", function(socket: Socket) {
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
            this.mitm.on("connection", function(socket: Socket) {
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
            this.mitm.on("connection", function(socket: Socket) {
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
            this.mitm.on("connection", function(socket: Socket) {
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
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            try
            {
                const conn = new Connection(testHOST);
                await conn.loginAsync("velux123");
                return Promise.resolve(expect(conn.KLF200SocketProtocol).to.be.instanceOf(KLF200SocketProtocol));
            }
            catch(error) {
                return Promise.reject(error);
            }
        });
    });
});
