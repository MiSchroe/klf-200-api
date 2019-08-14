/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_NEW_GROUP_REQ, GroupType, readZString } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_NEW_GROUP_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_NEW_GROUP_REQ("Dummy", GroupType.UserGroup, [42, 87])).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_NEW_GROUP_REQ("Dummy", GroupType.UserGroup, [42, 87]);
            expect(result).to.be.instanceOf(GW_NEW_GROUP_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(readZString(buff.slice(6, 70))).to.be.equal("Dummy", "Name wrong.");
            expect(buff.readUInt8(72)).to.be.equal(0, "GroupType wrong.");
            expect(buff.readUInt8(73)).to.be.equal(2, "Number of nodes wrong.");
            expect(buff.readUInt8(79)).to.be.equal(0b00000100, "Node 42 wrong.");
            expect(buff.readUInt8(84)).to.be.equal(0b10000000, "Node 87 wrong.");
            expect(buff.readUInt16BE(3)).to.be.equal(0, "Order wrong.");
            expect(buff.readUInt8(5)).to.be.equal(0, "Placement wrong.");
            expect(buff.readUInt8(70)).to.be.equal(0, "Velocity wrong.");
            expect(buff.readUInt8(71)).to.be.equal(0, "NodeVariation wrong.");
        });
    });
});