"use strict";

import { GW_WINK_SEND_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_WINK_SEND_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_WINK_SEND_REQ(42)).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_WINK_SEND_REQ(42);
            expect(result).to.be.instanceOf(GW_WINK_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(5)).to.be.equal(1, "CommandOriginator wrong.");
            expect(buff.readUInt8(6)).to.be.equal(3, "PriorityLevel wrong.");
            expect(buff.readUInt8(7)).to.be.equal(1, "EnableWink wrong.");
            expect(buff.readUInt8(8)).to.be.equal(254, "WinkTime wrong.");
            expect(buff.readUInt8(9)).to.be.equal(1, "Number of nodes wrong.");
            expect(buff.readUInt8(10)).to.be.equal(42, "NodeID wrong.");
        });

        it("should write the correct node ID values", function() {
            const result = new GW_WINK_SEND_REQ([42, 43], false);
            expect(result).to.be.instanceOf(GW_WINK_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(9)).to.be.equal(2, "Number of nodes wrong.");
            expect(buff.readUInt8(10)).to.be.equal(42, "NodeID 42 wrong.");
            expect(buff.readUInt8(11)).to.be.equal(43, "NodeID 43 wrong.");
            expect(buff.readUInt8(7)).to.be.equal(0, "EnableWink wrong.");
        });

        it("shouldn't throw with 20 nodes", function() {
            expect(() =>  new GW_WINK_SEND_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).not.to.throw();
        });

        it("should throw with more than 20 nodes", function() {
            expect(() =>  new GW_WINK_SEND_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])).to.throw();
        });
    });
});