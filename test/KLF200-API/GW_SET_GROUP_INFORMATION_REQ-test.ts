"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_GROUP_INFORMATION_REQ, GroupType, readZString } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_GROUP_INFORMATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(
				() => new GW_SET_GROUP_INFORMATION_REQ(42, 0x1234, "Dummy", GroupType.UserGroup, [0, 1, 2]),
			);
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_GROUP_INFORMATION_REQ(42, 0x1234, "Dummy", GroupType.UserGroup, [0, 1, 2]);
			assert.ok(result instanceof GW_SET_GROUP_INFORMATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 42, "GroupID wrong.");
			assert.strictEqual(buff.readUInt16BE(4), 0, "Order wrong.");
			assert.strictEqual(buff.readUInt8(6), 0, "Placement wrong.");
			assert.strictEqual(readZString(buff.subarray(7, 67)), "Dummy", "Name wrong.");
			assert.strictEqual(buff.readUInt8(71), 0, "Velocity wrong.");
			assert.strictEqual(buff.readUInt8(72), 0, "NodeVariation wrong.");
			assert.strictEqual(buff.readUInt8(73), GroupType.UserGroup, "GroupType wrong.");
			assert.strictEqual(buff.readUInt8(74), 3, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(75), 0b00000111, "Nodes wrong.");
			assert.strictEqual(buff.readUInt16BE(100), 0x1234, "Revision wrong.");
		});
	});
});
