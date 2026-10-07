"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_NODE_INFORMATION_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_NODE_INFORMATION_REQ", function () {
		const testNodeId = 42;
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_GET_NODE_INFORMATION_REQ(testNodeId));
		});

		it("should write the correct node ID", function () {
			const result = new GW_GET_NODE_INFORMATION_REQ(testNodeId);
			assert.ok(result instanceof GW_GET_NODE_INFORMATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), testNodeId);
		});
	});
});
