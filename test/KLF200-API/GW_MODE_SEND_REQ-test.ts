"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_MODE_SEND_REQ, PriorityLevelInformation } from "../../src";
describe("KLF200-API", function () {
	describe("GW_MODE_SEND_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_MODE_SEND_REQ(42));
		});

		it("should write the correct default values", function () {
			const result = new GW_MODE_SEND_REQ(42);
			assert.ok(result instanceof GW_MODE_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "CommandOriginator wrong.");
			assert.strictEqual(buff.readUInt8(6), 3, "PriorityLevel wrong.");
			assert.strictEqual(buff.readUInt8(7), 0, "ModeNumber wrong.");
			assert.strictEqual(buff.readUInt8(8), 0, "ModeParameter wrong.");
			assert.strictEqual(buff.readUInt8(30), 0, "PriorityLevelLock wrong.");
			assert.strictEqual(buff.readUInt16BE(31), 0, "PriorityLevels wrong.");
			assert.strictEqual(buff.readUInt8(33), 255, "LockTime wrong.");
		});

		it("should write the single node", function () {
			const result = new GW_MODE_SEND_REQ(42);
			assert.ok(result instanceof GW_MODE_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(9), 1, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(10), 42, "Node array wrong.");
		});

		it("should write multiple nodes", function () {
			const result = new GW_MODE_SEND_REQ([42, 87]);
			assert.ok(result instanceof GW_MODE_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(9), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(10), 42, "Node array byte 1 wrong.");
			assert.strictEqual(buff.readUInt8(11), 87, "Node array byte 2 wrong.");
		});

		it("shouldn't throw an error with 20 nodes", function () {
			assert.doesNotThrow(
				() => new GW_MODE_SEND_REQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
			);
		});

		it("should throw an error with more than 20 nodes", function () {
			assert.throws(
				() => new GW_MODE_SEND_REQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]),
			);
		});

		it("shouldn't throw an error with 8 priority levels", function () {
			assert.doesNotThrow(
				() =>
					new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
					]),
			);
		});

		it("should throw an error with more than 8 priority levels", function () {
			assert.throws(
				() =>
					new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
						PriorityLevelInformation.Enable,
					]),
			);
		});

		it("should throw an error with a negative priority level", function () {
			assert.throws(
				// @ts-expect-error: error TS2322: Type '-1' is not assignable to type 'PriorityLevelInformation'
				() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [-1]),
			);
		});

		it("should throw an error with a priority level greater than 3", function () {
			assert.throws(
				// @ts-expect-error: error TS2322: Type '4' is not assignable to type 'PriorityLevelInformation'
				() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [4]),
			);
		});

		it("shouldn't throw an error with priority levels 0-3", function () {
			assert.doesNotThrow(
				() => new GW_MODE_SEND_REQ(42, undefined, undefined, undefined, undefined, undefined, [0, 1, 2, 3]),
			);
		});

		it("should write the correct priority levels 0-3", function () {
			const result = new GW_MODE_SEND_REQ(
				42,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				[0, 1, 2, 3],
			);
			assert.ok(result instanceof GW_MODE_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(31), 0b00011011, "PL_0_3 wrong.");
		});
	});
});
