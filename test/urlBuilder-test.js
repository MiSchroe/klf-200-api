'use strict';

const chai = require('chai');
const expect = chai.expect;
const urlBuilder = require('./../src/urlBuilder');

describe('UrlBuilder', function () {
    it('getPath() should throw an error on empty functionName', function () {
        expect(() => urlBuilder.getPath(null)).to.throw('Parameter \'functionName\' must not be empty.');
    });

    it('getPath() should throw an error on unknwon functionName', function () {
        expect(() => urlBuilder.getPath('unknown')).to.throw('Function "unknown" not supported.');
    });

    it('getPath() should return the correct URL', function () {
        expect(urlBuilder.getPath(urlBuilder.authentication)).to.equal('/api/v1/auth');
    });

});
