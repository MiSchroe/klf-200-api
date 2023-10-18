/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_MODE_SEND_REQ, PriorityLevelInformation } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_MODE_SEND_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_MODE_SEND_REQ(42)).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_MODE_SEND_REQ(42);
            expect(result).to.be.instanceOf(GW_MODE_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(5)).to.be.equal(1, "CommandOriginator wrong.");
            expect(buff.readUInt8(6)).to.be.equal(3, "PriorityLevel wrong.");
            expect(buff.readUInt8(7)).to.be.equal(0, "ModeNumber wrong.");
            expect(buff.readUInt8(8)).to.be.equal(0, "ModeParameter wrong.");
            expect(buff.readUInt8(30)).to.be.equal(0, "PriorityLevelLock wrong.");
            expect(buff.readUInt16BE(31)).to.be.equal(0, "PriorityLevels wrong.");
            expect(buff.readUInt8(33)).to.be.equal(255, "LockTime wrong.");
        });

        it("should write the single node", function() {
            const result = new GW_MODE_SEND_REQ(42);
            expect(result).to.be.instanceOf(GW_MODE_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(9)).to.be.equal(1, "Number of nodes wrong.");
            expect(buff.readUInt8(10)).to.be.equal(42, "Node array wrong.");
        });

        it("should write multiple nodes", function() {
            const result = new GW_MODE_SEND_REQ([42, 87]);
            expect(result).to.be.instanceOf(GW_MODE_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(9)).to.be.equal(2, "Number of nodes wrong.");
            expect(buff.readUInt8(10)).to.be.equal(42, "Node array byte 1 wrong.");
            expect(buff.readUInt8(11)).to.be.equal(87, "Node array byte 2 wrong.");
        });

        it("shouldn't throw an error with 20 nodes", function() {
            expect(() => new GW_MODE_SEND_REQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])).not.to.throw();
        });

        it("should throw an error with more than 20 nodes", function() {
            expect(() => new GW_MODE_SEND_REQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])).to.throw();
        });

        it("shouldn't throw an error with 8 priority levels", function() {
            expect(() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable])).not.to.throw();
        });

        it("should throw an error with more than 8 priority levels", function() {
            expect(() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable, PriorityLevelInformation.Enable])).to.throw();
        });

        it("should throw an error with a negative priority level", function() {
            // @ts-expect-error: error TS2322: Type '-1' is not assignable to type 'PriorityLevelInformation'
            expect(() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [-1])).to.throw();
        });

        it("should throw an error with a priority level greater than 3", function() {
            // @ts-expect-error: error TS2322: Type '4' is not assignable to type 'PriorityLevelInformation'
            expect(() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [4])).to.throw();
        });

        it("shouldn't throw an error with priority levels 0-3", function() {
            expect(() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [0, 1, 2, 3])).not.to.throw();
        });

        it("should write the correct priority levels 0-3", function() {
            const result = new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [0, 1, 2, 3]);
            expect(result).to.be.instanceOf(GW_MODE_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(31)).to.be.equal(0b00011011, "PL_0_3 wrong.");
        });
    });
});