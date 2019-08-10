/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_SET_UTC_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_SET_UTC_REQ", function() {
        const testTime = new Date();
        testTime.setMilliseconds(0);    // We don't want milliseconds
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_SET_UTC_REQ()).not.to.throw;
        });

        it("should write the correct date/time", function() {
            const result = new GW_SET_UTC_REQ(testTime);
            expect(result).to.be.instanceOf(GW_SET_UTC_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(new Date(buff.readUInt32BE(3) * 1000)).to.be.deep.equal(testTime);
        });
    });
});