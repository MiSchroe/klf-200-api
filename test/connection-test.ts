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

// const chai = require('chai');
// const expect = chai.expect;
// const nock = require('nock');

// const connection = require('./../src/connection');

// const testHost = 'test';
// const testURL = 'http://' + testHost;
// const testAPI = '/api/v1/auth';
// const testValidPW = 'velux123';
// const testInvalidPW = 'invalidPW';
// const testDefectJSONPrefix = ')]}\',\n';
// const testToken = '/WGoAkAwn1fSOV04E2QBRA==';
// const actionLogin = 'login';
// const actionLogout = 'logout';
// const tokenPropertyName = 'token';
// const validLoginRequest = { action: actionLogin, params: { password: testValidPW } };
// const invalidLoginReuest = { action: actionLogin, params: { password: testInvalidPW } };
// const logoutRequest = {
//     action: actionLogout, params: {}
// };

// let scope;

// describe('Connection', function () {
//     beforeEach(function () {
//         scope = nock(testURL)
//             .post(testAPI, validLoginRequest)
//             .reply(200, { token: testToken, result: true, deviceStatus: 'IDLE', data: {}, errors: [] })
//             .post(testAPI, invalidLoginReuest)
//             .reply(200, { result: false, deviceStatus: 'IDLE', data: {}, errors: [401] })
//             .post(testAPI, logoutRequest)
//             .reply(200, { result: true, deviceStatus: 'IDLE', data: {}, errors: [] });
//     });

//     afterEach(function () {
//         nock.cleanAll();
//     });

//     describe('loginAsync()', function () {

//         it('successful login if provided a valid password', function () {
//             let conn = new connection(testHost);
//             return conn.loginAsync(testValidPW).then(function (val) {
//                 expect(val).to.be.true;
//                 expect(conn).to.have.property(tokenPropertyName, testToken);
//             });
//         });

//         it('login fails if provided an invalid password', function () {
//             let conn = new connection(testHost);
//             return conn.loginAsync(testInvalidPW)
//                 .then(function (val) {
//                     throw new Error('Unexpected fulfilled promise');
//                 })
//                 .catch(function (errors) {
//                     expect(errors).to.be.instanceOf(Error).that.has.property('message', '401');
//                 });
//         });

//         it('should work on malformed response', function () {
//             nock.cleanAll();
//             scope = nock(testURL)
//                 .post(testAPI, validLoginRequest)
//                 .reply(200, testDefectJSONPrefix + JSON.stringify({ token: testToken, result: true, deviceStatus: 'IDLE', data: {}, errors: [] }));

//             let conn = new connection(testHost);
//             return conn.loginAsync(testValidPW).then(function (val) {
//                 expect(val).to.be.true;
//                 expect(conn).to.have.property(tokenPropertyName, testToken);
//             });
//         });

//         it('should throw on missing token', function () {
//             nock.cleanAll();
//             scope = nock(testURL)
//                 .post(testAPI, validLoginRequest)
//                 .reply(200, { token: '', result: true, deviceStatus: 'IDLE', data: {}, errors: [] });

//             let conn = new connection(testHost);
//             return conn.loginAsync(testValidPW)
//                 .then(function (val) {
//                     throw new Error('Unexpected fulfilled promise');
//                 })
//                 .catch(function (error) {
//                     expect(error).to.be.instanceOf(Error).that.has.property('message', 'No login token found');
//                     expect(conn).not.to.have.property(tokenPropertyName);
//                 });
//         });

//         it('second login possible', function () {
//             let conn = new connection(testHost);
//             conn.token = '/WGjfWfwn1fSOV04E2QBRA==';
//             return conn.loginAsync(testValidPW).then(function (val) {
//                 expect(val).to.be.true;
//                 expect(conn).to.have.property(tokenPropertyName, testToken);
//             });
//         });

//     });

//     describe('logoutAsync()', function () {

//         it('successful logout', function () {
//             let conn = new connection(testHost);
//             conn.token = testToken;
//             return conn.logoutAsync()
//                 .then(function (val) {
//                     expect(val).to.be.true;
//                     expect(conn).not.to.have.property(tokenPropertyName);
//                 });
//         });

//         it('successful logout without token', function () {
//             let conn = new connection(testHost);
//             return conn.logoutAsync()
//                 .then(function (val) {
//                     expect(val).to.be.true;
//                     expect(conn).not.to.have.property(tokenPropertyName);
//                 });
//         });

//         it('should handle errors', function () {
//             const errorText = 'some error';

//             nock.cleanAll();
//             scope = nock(testURL)
//                 .post(testAPI, logoutRequest)
//                 .replyWithError(errorText);

//             let conn = new connection(testHost);
//             conn.token = testToken;
//             let result = conn.logoutAsync()
//                 .then(function (val) {
//                     throw new Error('Unexpected fulfilled promise');
//                 })
//                 .catch(function (error) {
//                     expect(error).to.be.instanceOf(Error).that.has.property('message', errorText);
//                     return Promise.resolve();
//                 });

//             return result.catch();
//         });

//         it('should handle JSON parse errors', function () {
//             nock.cleanAll();
//             scope = nock(testURL)
//                 .post(testAPI, logoutRequest)
//                 .reply(200, JSON.stringify({ result: true, deviceStatus: 'IDLE', data: {}, errors: [] }).slice(-1),
//                 {
//                     "content-type": 'application/json'
//                 }
//             );

//             let conn = new connection(testHost);
//             conn.token = testToken;
//             let result = conn.logoutAsync()
//                 .then(function (val) {
//                     throw new Error('Unexpected fulfilled promise');
//                 })
//                 .catch(function (error) {
//                     expect(error).to.be.instanceOf(Error).that.has.property('message');
//                     return Promise.resolve();
//                 });

//             return result.catch();
//         });

//     });

//     describe('postAsync()', function () {

//         it('should handle errors', function () {
//             let conn = new connection(testHost);
//             let result = conn.postAsync('invalidFunction', null, null)
//                 .then(function (val) {
//                     throw new Error('Unexpected fulfilled promise');
//                 })
//                 .catch(function (error) {
//                     expect(error).to.be.instanceOf(Error).that.has.property('message');
//                     return Promise.resolve();
//                 });

//             return result.catch();
//         });

//     });

// });
