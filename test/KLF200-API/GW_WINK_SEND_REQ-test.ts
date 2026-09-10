"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_WINK_SEND_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_WINK_SEND_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_WINK_SEND_REQ(42));
		});

		it("should write the correct default values", function () {
			const result = new GW_WINK_SEND_REQ(42);
			assert.ok(result instanceof GW_WINK_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "CommandOriginator wrong.");
			assert.strictEqual(buff.readUInt8(6), 3, "PriorityLevel wrong.");
			assert.strictEqual(buff.readUInt8(7), 1, "EnableWink wrong.");
			assert.strictEqual(buff.readUInt8(8), 254, "WinkTime wrong.");
			assert.strictEqual(buff.readUInt8(9), 1, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(10), 42, "NodeID wrong.");
		});

		it("should write the correct node ID values", function () {
			const result = new GW_WINK_SEND_REQ([42, 43], false);
			assert.ok(result instanceof GW_WINK_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(9), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(10), 42, "NodeID 42 wrong.");
			assert.strictEqual(buff.readUInt8(11), 43, "NodeID 43 wrong.");
			assert.strictEqual(buff.readUInt8(7), 0, "EnableWink wrong.");
		});

		it("shouldn't throw with 20 nodes", function () {
			assert.doesNotThrow(
				() => new GW_WINK_SEND_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
			);
		});

		it("should throw with more than 20 nodes", function () {
			assert.throws(
				() => new GW_WINK_SEND_REQ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
			);
		});
	});
});
