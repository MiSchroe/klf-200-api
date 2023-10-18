"use strict";

import { GW_SET_NODE_VARIATION_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_SET_NODE_VARIATION_REQ", function() {
        it("shouldn't throw an error on create", function() {
            // @ts-expect-error: error TS2345: Argument of type '86' is not assignable to parameter of type 'NodeVariation | undefined'
            expect(() => new GW_SET_NODE_VARIATION_REQ(42, 0x56)).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_SET_NODE_VARIATION_REQ(42);
            expect(result).to.be.instanceOf(GW_SET_NODE_VARIATION_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(42, "NodeID wrong.")
            expect(buff.readUInt8(4)).to.be.equal(0, "NodeVariation wrong.")
        });

        it("should write the correct values", function() {
            // @ts-expect-error: error TS2345: Argument of type '86' is not assignable to parameter of type 'NodeVariation | undefined'
            const result = new GW_SET_NODE_VARIATION_REQ(42, 0x56);
            expect(result).to.be.instanceOf(GW_SET_NODE_VARIATION_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(42, "NodeID wrong.")
            expect(buff.readUInt8(4)).to.be.equal(0x56, "NodeVariation wrong.")
        });
    });
});