"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_ACTIVATE_PRODUCTGROUP_REQ, PriorityLevelInformation } from "../../src";
describe("KLF200-API", function () {
	describe("GW_ACTIVATE_PRODUCTGROUP_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711));
		});

		it("should create the right object with default values", function () {
			const result = new GW_ACTIVATE_PRODUCTGROUP_REQ(1, 0x4711);
			assert.ok(result instanceof GW_ACTIVATE_PRODUCTGROUP_REQ);
			assert.ok("SessionID" in result);
			assert.strictEqual(result.GroupID, 1);
			assert.strictEqual(result.Position, 0x4711);
			assert.strictEqual(result.PriorityLevel, 3);
			assert.strictEqual(result.CommandOriginator, 1);
			assert.strictEqual(result.ParameterActive, 0);
			assert.strictEqual(result.Velocity, 0);
			assert.strictEqual(result.PriorityLevelLock, 0);
			assert.deepStrictEqual(result.PriorityLevels, []);
			assert.strictEqual(result.LockTime, Infinity);
		});

		it("should write the priority levels at the right position", function () {
			const result = new GW_ACTIVATE_PRODUCTGROUP_REQ(
				1,
				0x4711,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				[
					PriorityLevelInformation.Disable,
					PriorityLevelInformation.Enable,
					PriorityLevelInformation.EnableAll,
					PriorityLevelInformation.KeepCurrent,
					PriorityLevelInformation.Enable,
				],
			);
			assert.ok(result instanceof GW_ACTIVATE_PRODUCTGROUP_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt16BE(13), 0x1b40, `Data = ${buff.toString("hex")}`);
		});

		it("should throw an error at priority level value greater than 3", function () {
			assert.throws(
				() =>
					new GW_ACTIVATE_PRODUCTGROUP_REQ(
						1,
						0x4711,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						[
							// @ts-expect-error: error TS2322: Type '4' is not assignable to type 'PriorityLevelInformation'
							4,
						],
					),
			);
		});

		it("should throw an error at priority level less than 0", function () {
			assert.throws(
				() =>
					new GW_ACTIVATE_PRODUCTGROUP_REQ(
						1,
						0x4711,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						[
							// @ts-expect-error: error TS2322: Type '-1' is not assignable to type 'PriorityLevelInformation'
							-1,
						],
					),
			);
		});

		it("should throw an error at too many priority levels (more than 8)", function () {
			assert.throws(
				() =>
					new GW_ACTIVATE_PRODUCTGROUP_REQ(
						1,
						0x4711,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						[0, 1, 2, 3, 0, 1, 2, 3, 0],
					),
			);
		});
	});
});
