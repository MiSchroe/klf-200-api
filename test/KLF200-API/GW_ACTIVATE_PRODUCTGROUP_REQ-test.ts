/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_ACTIVATE_PRODUCTGROUP_REQ, PriorityLevelInformation } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_ACTIVATE_PRODUCTGROUP_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711)).not.to.throw;
        });

        it("should create the right object with default values", function() {
            const result = new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("SessionID");
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("GroupID", 1);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("Position", 0x4711);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("PriorityLevel", 3);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("CommandOriginator", 1);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("ParameterActive", 0);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("Velocity", 0);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("PriorityLevelLock", 0);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("PriorityLevels").that.eqls([]);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("LockTime", Infinity);
        });

        it("should write the priority levels at the right position", function() {
            const result = new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [PriorityLevelInformation.Disable, PriorityLevelInformation.Enable, PriorityLevelInformation.EnableAll, PriorityLevelInformation.KeepCurrent, PriorityLevelInformation.Enable]);
            expect(result).to.be.instanceOf(GW_ACTIVATE_PRODUCTGROUP_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt16BE(13)).to.be.equal(0x1b40, `Data = ${buff.toString("hex")}`);
        });

        it("should throw an error at priority level value greater than 3", function() {
            expect(() => new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [4])).to.throw;
        });

        it("should throw an error at priority level less than 0", function() {
            expect(() => new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [-1])).to.throw;
        });

        it("should throw an error at too many priority levels (more than 8)", function() {
            expect(() => new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [0, 1, 2, 3, 0, 1, 2, 3, 0])).to.throw;
        });
    });
});