'use strict';

import Mitm from "mitm";
import { Socket } from "net";
import { SLIPProtocol, KLF200Protocol } from "../src/KLF200-API/common";
import { Connection } from "../src/connection";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { GW_PASSWORD_ENTER_REQ } from "../src";

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
        it("should succeed with correct passowrd.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            await expect(conn.loginAsync("velux123")).to.eventually.be.fulfilled;
        });

        it("should throw an error with incorrect passowrd.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x01]));
                });
            });

            const conn = new Connection(testHOST);
            await expect(conn.loginAsync("velux123")).to.eventually.be.rejectedWith(Error);
        });

        it("should throw an error on GW_ERROR_NTF.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x00, 0x00, 0x0c]));
                });
            });

            const conn = new Connection(testHOST);
            await expect(conn.loginAsync("velux123")).to.eventually.be.rejectedWith(Error);
        });

        it("should throw an error after timeout.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    setTimeout(function() {
                        socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                    }, 2000);
                });
            });

            const conn = new Connection(testHOST);
            await expect(conn.loginAsync("velux123", 1)).to.eventually.be.rejectedWith(Error);
        });
    });

    describe("logoutAsync", function() {
        it("should fulfill if not logged in.", async function() {
            const conn = new Connection(testHOST);
            await expect(conn.logoutAsync()).to.eventually.be.fulfilled;
        });

        it("should fulfill if logged in.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            await conn.loginAsync("velux123");
            await expect(conn.logoutAsync()).to.eventually.be.fulfilled;
        });
    });

    describe("sendFrameAsync", function() {
        it("should return the corresponding confirmation.", async function() {
            this.mitm.on("connection", function(socket: Socket) {
                socket.on("data", () => {
                    socket.write(rawBufferFrom([0x30, 0x01, 0x00]));
                });
            });

            const conn = new Connection(testHOST);
            await conn.loginAsync("velux123");
            await expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"))).to.eventually.be.fulfilled;
        });

        it("should timeout on missing confirmation.", async function() {
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
            await conn.loginAsync("velux123");
            await expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.eventually.be.rejectedWith(Error);
        });

        it("should reject on error frame.", async function() {
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
            await conn.loginAsync("velux123");
            await expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.eventually.be.rejectedWith(Error);
        });

        it("should ignore wrong confirmation.", async function() {
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
            await conn.loginAsync("velux123");
            await expect(conn.sendFrameAsync(new GW_PASSWORD_ENTER_REQ("velux123"), 1)).to.eventually.be.fulfilled;
        });
    });
});
