'use strict';

const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');

const scenes = require('./../src/scenes');
const connection = require('./../src/connection');

const testHost = 'test';
const testURL = 'http://' + testHost;
const testAPI = '/api/v1/scenes';
const testValidPW = 'velux123';
const testToken = '/WGoAkAwn1fSOV04E2QBRA==';
const actionGet = 'get';
const tokenPropertyName = 'token';
const validGetRequest = { action: actionGet, params: {} };
const validGetResponse = {
    "token": testToken,
    "result": true,
    "deviceStatus": "IDLE",
    "data": [{
        "name": "Window kitchen 10%",
        "id": 0,
        "silent": false,
        "products": [{
            "typeId": 4,
            "name": "Window kitchen",
            "actuator": 0,
            "status": 10
        }
        ]
    },
    {
        "name": "Window kitchen 20%",
        "id": 1,
        "silent": false,
        "products": [{
            "typeId": 4,
            "name": "Window kitchen",
            "actuator": 0,
            "status": 20
        }
        ]
    }
    ],
    "errors": []
};

const actionRun = 'run';
const sceneId = 0;
const sceneName = 'Window kitchen 10%';
const sceneNameMissing = 'Window kitchen 30%';
const validRunRequest = {
    action: actionRun, params: { id: sceneId }
};
const validEmptyResponse = {
    "token": testToken,
    "result": true,
    "deviceStatus": "IDLE",
    "data": {},
    "errors": []
};

let scope;

describe('Scenes', function () {
    beforeEach(function () {
        scope = nock(testURL)
            .post(testAPI, validGetRequest)
            .reply(200, validGetResponse)
            .post(testAPI, validRunRequest)
            .reply(200, validEmptyResponse);
    });

    afterEach(function () {
        nock.cleanAll();
    });

    describe('getAsync()', function () {

        it('successful list scenes', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.getAsync().then(function (val) {
                expect(val).to.be.deep.equal(validGetResponse.data);
            });
        });

    });

    describe('runAsync()', function () {

        it('successful runs a scene by id', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.runAsync(sceneId);
        });

        it('successful runs a scene by name', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.runAsync(sceneName);
        });

        it('error running a non-existing scene by name', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.runAsync(sceneNameMissing).then(function (val) {
                throw new Error('Unexpected fulfilled promise');
            })
                .catch(function (error) {
                    expect(error).to.be.instanceOf(Error).with.property('message', `Scene "${sceneNameMissing}" not found`);
                });
        });

        it('error running without parameter', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.runAsync(null).then(function (val) {
                throw new Error('Unexpected fulfilled promise');
            })
                .catch(function (error) {
                    expect(error).to.be.instanceOf(Error).with.property('message', 'Missing sceneId parameter.');
                });
        });

        it('error running with wrong parameter type', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let scen = new scenes(conn);
            return scen.runAsync(new Object()).then(function (val) {
                throw new Error('Unexpected fulfilled promise');
            })
                .catch(function (error) {
                    expect(error).to.be.instanceOf(Error).with.property('message', 'Parameter sceneId must be of type number or string.');
                });
        });

    });
});
