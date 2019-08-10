/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ", function() {
        const testDate = new Date();
        testDate.setMilliseconds(0);    // We don't want to hassle with fraction numbers here.
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ(testDate)).not.to.throw();
        });

        it("should write the correct date", function() {
            const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ(testDate);
            expect(result).to.be.instanceOf(GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt32BE(3)).to.be.equal(testDate.valueOf() / 1000);
        });
    });
});