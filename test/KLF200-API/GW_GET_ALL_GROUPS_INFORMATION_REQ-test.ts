"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_ALL_GROUPS_INFORMATION_REQ, GroupType } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_ALL_GROUPS_INFORMATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ());
			assert.doesNotThrow(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.UserGroup));
			assert.doesNotThrow(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.Room));
			assert.doesNotThrow(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.House));
			assert.doesNotThrow(() => new GW_GET_ALL_GROUPS_INFORMATION_REQ(GroupType.All));
		});

		it("should set no filter with empty parameter", function () {
			const result = new GW_GET_ALL_GROUPS_INFORMATION_REQ();
			assert.ok(result instanceof GW_GET_ALL_GROUPS_INFORMATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 0, "Wrong value for filter");
			assert.strictEqual(buff.readUInt8(4), 0, "Wrong value for group type");
			assert.strictEqual(result.UseFilter, false);
			assert.strictEqual(result.GroupType, GroupType.UserGroup);
		});

		const groupTypesToTest = [GroupType.UserGroup, GroupType.Room, GroupType.House, GroupType.All];
		groupTypesToTest.forEach((groupTypeToTest) => {
			it(`should set filter to true and group type ${groupTypeToTest.toString()}`, function () {
				const result = new GW_GET_ALL_GROUPS_INFORMATION_REQ(groupTypeToTest);
				assert.ok(result instanceof GW_GET_ALL_GROUPS_INFORMATION_REQ);
				assert.ok("Data" in result);
				const buff = result.Data;
				assert.strictEqual(buff.readUInt8(3), 1, "Wrong value for filter");
				assert.strictEqual(buff.readUInt8(4), groupTypeToTest, "Wrong value for group type");
				assert.strictEqual(result.UseFilter, true);
				assert.strictEqual(result.GroupType, groupTypeToTest);
			});
		});
	});
});
