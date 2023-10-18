"use strict";

import { GW_COMMAND_SEND_REQ, PriorityLevelInformation, FunctionalParameter } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_COMMAND_SEND_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_COMMAND_SEND_REQ(1, 0x4711)).not.to.throw();
        });

        it("should create the right object with default values", function() {
            const result = new GW_COMMAND_SEND_REQ(1, 0x4711);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("Nodes");
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("MainValue");
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("PriorityLevel", 3);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("CommandOriginator", 1);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("ParameterActive", 0);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("FunctionalParameters").that.eqls([]);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("PriorityLevelLock", 0);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("PriorityLevels").that.eqls([]);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("LockTime", Infinity);
        });

        it("should write the priority levels at the right position", function() {
            const result = new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [PriorityLevelInformation.Disable, PriorityLevelInformation.Enable, PriorityLevelInformation.EnableAll, PriorityLevelInformation.KeepCurrent, PriorityLevelInformation.Enable]);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt16BE(66)).to.be.equal(0x1b40, `Data = ${buff.toString("hex")}`);
        });

        it("should throw an error at priority level value greater than 3", function() {
            // @ts-expect-error: error TS2322: Type '4' is not assignable to type 'PriorityLevelInformation'
            expect(() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [4])).to.throw();
        });

        it("should throw an error at priority level less than 0", function() {
            // @ts-expect-error: error TS2322: Type '-1' is not assignable to type 'PriorityLevelInformation'
            expect(() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [-1])).to.throw();
        });

        it("should throw an error at too many priority levels (more than 8)", function() {
            expect(() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [0, 1, 2, 3, 0, 1, 2, 3, 0])).to.throw();
        });

        it("should write the functional parameter the right way", function() {
            const result = new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, [{ID: 3, Value: 0x4711}, {ID: 10, Value: 0x4712}]);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(8)).to.be.equal(0b00100000, "FPI1 is wrong");
            expect(buff.readUInt8(9)).to.be.equal(0b01000000, "FPI2 is wrong");
            expect(buff.readUInt16BE(16)).to.be.equal(0x4711, `Data = ${buff.toString("hex")}, Functional Parameter 3 is wrong`);
            expect(buff.readUInt16BE(30)).to.be.equal(0x4712, `Data = ${buff.toString("hex")}, Functional Parameter 10 is wrong`);
        });

        it("should throw an error on invalid functional parameter ID", function() {
            expect(() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, [{ID: 17, Value: 0x4711}])).to.throw();
        });

        it("should write multiple nodes", function() {
            const result = new GW_COMMAND_SEND_REQ([1, 2, 3], 0x4711);
            expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(44)).to.be.equal(3, "Number of nodes is wrong");
            expect(buff.readUInt8(45)).to.be.equal(1, "Node 1 is wrong");
            expect(buff.readUInt8(46)).to.be.equal(2, "Node 2 is wrong");
            expect(buff.readUInt8(47)).to.be.equal(3, "Node 3 is wrong");
            expect(buff.readUInt8(48)).to.be.equal(0, "Too many nodes written");
        });

        it("should throw an error if more than 20 nodes are provided", function() {
            expect(() => new GW_COMMAND_SEND_REQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 0x4711)).to.throw();
        });
    });
});