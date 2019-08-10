/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_SET_NODE_ORDER_AND_PLACEMENT_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_SET_NODE_ORDER_AND_PLACEMENT_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(42, 0x1234, 0x56)).not.to.throw;
        });

        it("should write the correct values", function() {
            const result = new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(42, 0x1234, 0x56);
            expect(result).to.be.instanceOf(GW_SET_NODE_ORDER_AND_PLACEMENT_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(42, "NodeID wrong.")
            expect(buff.readUInt16BE(4)).to.be.equal(0x1234, "Order wrong.")
            expect(buff.readUInt8(6)).to.be.equal(0x56, "Placement wrong.")
        });
    });
});