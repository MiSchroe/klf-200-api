"use strict";

import { GW_STATUS_REQUEST_REQ, StatusType } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_STATUS_REQUEST_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_STATUS_REQUEST_REQ(42, StatusType.RequestMainInfo)).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_STATUS_REQUEST_REQ(42, StatusType.RequestMainInfo);
            expect(result).to.be.instanceOf(GW_STATUS_REQUEST_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(5)).to.be.equal(1, "Number of nodes wrong.");
            expect(buff.readUInt8(6)).to.be.equal(42, "NodeID wrong.");
            expect(buff.readUInt8(26)).to.be.equal(StatusType.RequestMainInfo, "StatusType wrong.");
        });

        it("should write the correct NodeIDs", function() {
            const result = new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo);
            expect(result).to.be.instanceOf(GW_STATUS_REQUEST_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(5)).to.be.equal(2, "Number of nodes wrong.");
            expect(buff.readUInt8(6)).to.be.equal(42, "NodeID 42 wrong.");
            expect(buff.readUInt8(7)).to.be.equal(43, "NodeID 43 wrong.");
        });

        it("shouldn't throw on 20 nodes", function() {
            expect(() => new GW_STATUS_REQUEST_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], StatusType.RequestMainInfo)).not.to.throw();
        });

        it("should throw on 21 nodes", function() {
            expect(() => new GW_STATUS_REQUEST_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], StatusType.RequestMainInfo)).to.throw();
        });

        it("should write the correct functional parameters", function() {
            const result = new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16]);
            expect(result).to.be.instanceOf(GW_STATUS_REQUEST_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(27)).to.be.equal(0b10100000, "FPI1 wrong.");
            expect(buff.readUInt8(28)).to.be.equal(0b00100001, "FPI2 wrong.");
        });

        it("should throw on functional parameter less than 1", function() {
            expect(() => new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16, 0])).to.throw();
        });

        it("should throw on functional parameter greater than 16", function() {
            expect(() => new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16, 17])).to.throw();
        });
    });
});