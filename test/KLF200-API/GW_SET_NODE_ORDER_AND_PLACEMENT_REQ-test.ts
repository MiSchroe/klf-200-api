"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_NODE_ORDER_AND_PLACEMENT_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(42, 0x1234, 0x56));
		});

		it("should write the correct values", function () {
			const result = new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(42, 0x1234, 0x56);
			assert.ok(result instanceof GW_SET_NODE_ORDER_AND_PLACEMENT_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 42, "NodeID wrong.");
			assert.strictEqual(buff.readUInt16BE(4), 0x1234, "Order wrong.");
			assert.strictEqual(buff.readUInt8(6), 0x56, "Placement wrong.");
		});
	});
});
