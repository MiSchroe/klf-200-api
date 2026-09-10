"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_NEW_GROUP_REQ, GroupType, readZString } from "../../src";
describe("KLF200-API", function () {
	describe("GW_NEW_GROUP_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_NEW_GROUP_REQ("Dummy", GroupType.UserGroup, [42, 87]));
		});

		it("should write the correct default values", function () {
			const result = new GW_NEW_GROUP_REQ("Dummy", GroupType.UserGroup, [42, 87]);
			assert.ok(result instanceof GW_NEW_GROUP_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(readZString(buff.subarray(6, 70)), "Dummy", "Name wrong.");
			assert.strictEqual(buff.readUInt8(72), 0, "GroupType wrong.");
			assert.strictEqual(buff.readUInt8(73), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(79), 0b00000100, "Node 42 wrong.");
			assert.strictEqual(buff.readUInt8(84), 0b10000000, "Node 87 wrong.");
			assert.strictEqual(buff.readUInt16BE(3), 0, "Order wrong.");
			assert.strictEqual(buff.readUInt8(5), 0, "Placement wrong.");
			assert.strictEqual(buff.readUInt8(70), 0, "Velocity wrong.");
			assert.strictEqual(buff.readUInt8(71), 0, "NodeVariation wrong.");
		});
	});
});
