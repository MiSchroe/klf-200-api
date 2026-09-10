"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_LIMITATION_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_LIMITATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255));
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255);
			assert.ok(result instanceof GW_SET_LIMITATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "CommandOriginator wrong.");
			assert.strictEqual(buff.readUInt8(6), 3, "PriorityLevel wrong.");
			assert.strictEqual(buff.readUInt8(28), 0, "ParameterActive wrong.");
			assert.strictEqual(buff.readUInt16BE(29), 0xc400, "LimitationValueMin wrong.");
			assert.strictEqual(buff.readUInt16BE(31), 0xc2ff, "LimitationValueMax wrong.");
			assert.strictEqual(buff.readUInt8(33), 255, "LimitationTime wrong.");
		});

		it("should write the single node", function () {
			const result = new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255);
			assert.ok(result instanceof GW_SET_LIMITATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(7), 1, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(8), 42, "Node array wrong.");
		});

		it("should write multiple nodes", function () {
			const result = new GW_SET_LIMITATION_REQ([42, 87], 0xc400, 0xc2ff, 255);
			assert.ok(result instanceof GW_SET_LIMITATION_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(7), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(8), 42, "Node array byte 1 wrong.");
			assert.strictEqual(buff.readUInt8(9), 87, "Node array byte 2 wrong.");
		});

		it("shouldn't throw an error with 20 nodes", function () {
			assert.doesNotThrow(
				() =>
					new GW_SET_LIMITATION_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
						0xc400,
						0xc2ff,
						255,
					),
			);
		});

		it("should throw an error with more than 20 nodes", function () {
			assert.throws(
				() =>
					new GW_SET_LIMITATION_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
						0xc400,
						0xc2ff,
						255,
					),
			);
		});
	});
});
