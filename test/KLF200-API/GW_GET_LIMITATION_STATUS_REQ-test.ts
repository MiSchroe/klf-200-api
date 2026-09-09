"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_LIMITATION_STATUS_REQ, LimitationType } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_LIMITATION_STATUS_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_GET_LIMITATION_STATUS_REQ(42, LimitationType.MinimumLimitation));
		});

		it("should write the correct default values", function () {
			const result = new GW_GET_LIMITATION_STATUS_REQ(42, LimitationType.MaximumLimitation);
			assert.ok(result instanceof GW_GET_LIMITATION_STATUS_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(27), LimitationType.MaximumLimitation, "LimitationType wrong.");
			assert.strictEqual(buff.readUInt8(26), 0, "ParameterID wrong.");
		});

		it("should write the single node", function () {
			const result = new GW_GET_LIMITATION_STATUS_REQ(42, LimitationType.MaximumLimitation);
			assert.ok(result instanceof GW_GET_LIMITATION_STATUS_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(6), 42, "Node array wrong.");
		});

		it("should write multiple nodes", function () {
			const result = new GW_GET_LIMITATION_STATUS_REQ([42, 87], LimitationType.MaximumLimitation);
			assert.ok(result instanceof GW_GET_LIMITATION_STATUS_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(6), 42, "Node array byte 1 wrong.");
			assert.strictEqual(buff.readUInt8(7), 87, "Node array byte 2 wrong.");
		});

		it("shouldn't throw an error with 20 nodes", function () {
			assert.doesNotThrow(
				() =>
					new GW_GET_LIMITATION_STATUS_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
						LimitationType.MinimumLimitation,
					),
			);
		});

		it("should throw an error with more than 20 nodes", function () {
			assert.throws(
				() =>
					new GW_GET_LIMITATION_STATUS_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
						LimitationType.MinimumLimitation,
					),
			);
		});
	});
});
