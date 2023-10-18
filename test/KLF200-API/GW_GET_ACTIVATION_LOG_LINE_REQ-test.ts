"use strict";

import { GW_GET_ACTIVATION_LOG_LINE_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_GET_ACTIVATION_LOG_LINE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_GET_ACTIVATION_LOG_LINE_REQ(42)).not.to.throw();
        });

        it("should write the line number at the right position", function() {
            const result = new GW_GET_ACTIVATION_LOG_LINE_REQ(42);
            expect(result).to.be.instanceOf(GW_GET_ACTIVATION_LOG_LINE_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt16BE(3)).to.be.equal(42);
        });
    });
});