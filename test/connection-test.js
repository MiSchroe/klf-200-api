// 'use strict';

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
