"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_COMMAND_SEND_REQ, PriorityLevelInformation } from "../../src";
describe("KLF200-API", function () {
	describe("GW_COMMAND_SEND_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_COMMAND_SEND_REQ(1, 0x4711));
		});

		it("should create the right object with default values", function () {
			const result = new GW_COMMAND_SEND_REQ(1, 0x4711);
			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.ok("Nodes" in result);
			assert.ok("MainValue" in result);
			assert.strictEqual(result.PriorityLevel, 3);
			assert.strictEqual(result.CommandOriginator, 1);
			assert.strictEqual(result.ParameterActive, 0);
			assert.deepStrictEqual(result.FunctionalParameters, []);
			assert.strictEqual(result.PriorityLevelLock, 0);
			assert.deepStrictEqual(result.PriorityLevels, []);
			assert.strictEqual(result.LockTime, Infinity);
		});

		it("should write the priority levels at the right position", function () {
			const result = new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [
				PriorityLevelInformation.Disable,
				PriorityLevelInformation.Enable,
				PriorityLevelInformation.EnableAll,
				PriorityLevelInformation.KeepCurrent,
				PriorityLevelInformation.Enable,
			]);
			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt16BE(66), 0x1b40, `Data = ${buff.toString("hex")}`);
		});

		it("should throw an error at priority level value greater than 3", function () {
			assert.throws(
				// @ts-expect-error: error TS2322: Type '4' is not assignable to type 'PriorityLevelInformation'
				() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [4]),
			);
		});

		it("should throw an error at priority level less than 0", function () {
			assert.throws(
				// @ts-expect-error: error TS2322: Type '-1' is not assignable to type 'PriorityLevelInformation'
				() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, undefined, undefined, [-1]),
			);
		});

		it("should throw an error at too many priority levels (more than 8)", function () {
			assert.throws(
				() =>
					new GW_COMMAND_SEND_REQ(
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

		it("should write the functional parameter the right way", function () {
			const result = new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, [
				{ ID: 3, Value: 0x4711 },
				{ ID: 10, Value: 0x4712 },
			]);
			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(8), 0b00100000, "FPI1 is wrong");
			assert.strictEqual(buff.readUInt8(9), 0b01000000, "FPI2 is wrong");
			assert.strictEqual(
				buff.readUInt16BE(16),
				0x4711,
				`Data = ${buff.toString("hex")}, Functional Parameter 3 is wrong`,
			);
			assert.strictEqual(
				buff.readUInt16BE(30),
				0x4712,
				`Data = ${buff.toString("hex")}, Functional Parameter 10 is wrong`,
			);
		});

		it("should throw an error on invalid functional parameter ID", function () {
			assert.throws(
				() => new GW_COMMAND_SEND_REQ(1, 0x4711, undefined, undefined, undefined, [{ ID: 17, Value: 0x4711 }]),
			);
		});

		it("should write multiple nodes", function () {
			const result = new GW_COMMAND_SEND_REQ([1, 2, 3], 0x4711);
			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(44), 3, "Number of nodes is wrong");
			assert.strictEqual(buff.readUInt8(45), 1, "Node 1 is wrong");
			assert.strictEqual(buff.readUInt8(46), 2, "Node 2 is wrong");
			assert.strictEqual(buff.readUInt8(47), 3, "Node 3 is wrong");
			assert.strictEqual(buff.readUInt8(48), 0, "Too many nodes written");
		});

		it("should throw an error if more than 20 nodes are provided", function () {
			assert.throws(
				() =>
					new GW_COMMAND_SEND_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
						0x4711,
					),
			);
		});
	});
});
