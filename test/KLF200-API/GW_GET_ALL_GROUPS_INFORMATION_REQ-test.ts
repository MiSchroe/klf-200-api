/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_GET_ALL_GROUPS_INFORMATION_REQ, GroupType } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_GET_ALL_GROUPS_INFORMATION_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ()).not.to.throw();
            expect(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.UserGroup)).not.to.throw();
            expect(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.Room)).not.to.throw();
            expect(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.House)).not.to.throw();
            expect(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.All)).not.to.throw();
        });

        it("should set no filter with empty parameter", function() {
            const result = new GW_GET_ALL_GROUPS_INFORMATION_REQ();
            expect(result).to.be.instanceOf(GW_GET_ALL_GROUPS_INFORMATION_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(0, "Wrong value for filter");
            expect(buff.readUInt8(4)).to.be.equal(0, "Wrong value for group type");
            expect(result.UseFilter).to.be.false;
            expect(result.GroupType).to.be.equal(GroupType.UserGroup);
        });

        const groupTypesToTest = [GroupType.UserGroup, GroupType.Room, GroupType.House, GroupType.All];
        groupTypesToTest.forEach(groupTypeToTest => {
            it(`should set filter to true and group type ${groupTypeToTest.toString()}`, function() {
                const result = new GW_GET_ALL_GROUPS_INFORMATION_REQ(groupTypeToTest);
                expect(result).to.be.instanceOf(GW_GET_ALL_GROUPS_INFORMATION_REQ).that.has.property("Data");
                const buff = result.Data;
                expect(buff.readUInt8(3)).to.be.equal(1, "Wrong value for filter");
                expect(buff.readUInt8(4)).to.be.equal(groupTypeToTest, "Wrong value for group type");
                expect(result.UseFilter).to.be.true;
                expect(result.GroupType).to.be.equal(groupTypeToTest);
            });
        });
    });
});