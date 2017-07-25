'use strict';

const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');

const products = require('./../src/products');
const connection = require('./../src/connection');

const testHost = 'test';
const testURL = 'http://' + testHost;
const testAPI = '/api/v1/products';
const testValidPW = 'velux123';
const testToken = '/WGoAkAwn1fSOV04E2QBRA==';
const actionGet = 'get';
const tokenPropertyName = 'token';
const validGetRequest = { action: actionGet, params: {} };
const validGetResponse = {
    token: testToken,
    result: true,
    "deviceStatus": "IDLE",
    "data": [
        {
            "name": "Windows bathroom",
            "category": "Window opener",
            "id": 0,
            "typeId": 4,
            "subtype": 1,
            "scenes": []
        },
        {
            "name": "Window sleeping room",
            "category": "Window opener",
            "id": 1,
            "typeId": 4,
            "subtype": 1,
            "scenes": []
        },
        {
            "name": "Window kids room",
            "category": "Window opener",
            "id": 2,
            "typeId": 4,
            "subtype": 1,
            "scenes": []
        },
        {
            "name": "Roller shutter sleeping room",
            "category": "Roller shutter",
            "id": 3,
            "typeId": 2,
            "subtype": 0,
            "scenes": []
        },
        {
            "name": "Window kitchen",
            "category": "Window opener",
            "id": 4,
            "typeId": 4,
            "subtype": 1,
            "scenes": [
                "Window kitchen 10%",
                "Window kitchen 20%"
            ]
        }
    ],
    "errors": []
};

let scope;

describe('Products', function () {
    beforeEach(function () {
        scope = nock(testURL)
            .post(testAPI, validGetRequest)
            .reply(200, validGetResponse);
    });

    afterEach(function () {
        nock.cleanAll();
    });

    describe('getAsync()', function () {

        it('successful list connected products', function () {
            let conn = new connection(testHost);
            conn.token = testToken;

            let prod = new products(conn);
            return prod.getAsync().then(function (val) {
                expect(val).to.be.deep.equal(validGetResponse);
            });
        });
    });
});
