"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_NODE_VARIATION_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_NODE_VARIATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			// @ts-expect-error: error TS2345: Argument of type '86' is not assignable to parameter of type 'NodeVariation | undefined'
			assert.doesNotThrow(() => new GW_SET_NODE_VARIATION_REQ(42, 0x56));
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_NODE_VARIATION_REQ(42);
			assert.ok(result instanceof GW_SET_NODE_VARIATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 42, "NodeID wrong.");
			assert.strictEqual(buff.readUInt8(4), 0, "NodeVariation wrong.");
		});

		it("should write the correct values", function () {
			// @ts-expect-error: error TS2345: Argument of type '86' is not assignable to parameter of type 'NodeVariation | undefined'
			const result = new GW_SET_NODE_VARIATION_REQ(42, 0x56);
			assert.ok(result instanceof GW_SET_NODE_VARIATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 42, "NodeID wrong.");
			assert.strictEqual(buff.readUInt8(4), 0x56, "NodeVariation wrong.");
		});
	});
});
