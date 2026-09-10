"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_CONTACT_INPUT_LINK_REQ, ContactInputAssignment, Velocity, PriorityLevelInformation } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_CONTACT_INPUT_LINK_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(
				() =>
					new GW_SET_CONTACT_INPUT_LINK_REQ(
						3,
						ContactInputAssignment.NodeMode,
						4,
						5,
						0xc3ff,
						Velocity.Fast,
						42,
					),
			);
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_CONTACT_INPUT_LINK_REQ(
				3,
				ContactInputAssignment.NodeMode,
				4,
				5,
				0xc3ff,
				Velocity.Fast,
				42,
			);
			assert.ok(result instanceof GW_SET_CONTACT_INPUT_LINK_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 3, "ContactInputID");
			assert.strictEqual(buff.readUInt8(4), ContactInputAssignment.NodeMode, "ContactInputAssignment");
			assert.strictEqual(buff.readUInt8(18), 4, "SuccessOutputID");
			assert.strictEqual(buff.readUInt8(19), 5, "ErrorOutpuID");
			assert.strictEqual(buff.readUInt16BE(9), 0xc3ff, "Position");
			assert.strictEqual(buff.readUInt8(11), Velocity.Fast, "Velocity");
			assert.strictEqual(buff.readUInt8(5), 42, "ActionID");
			assert.strictEqual(buff.readUInt8(7), 3, "PriorityLevel");
			assert.strictEqual(buff.readUInt8(6), 1, "CommandOriginator");
			assert.strictEqual(buff.readUInt8(8), 0, "ParameterActive");
			assert.strictEqual(buff.readUInt8(12), 0, "LockPriorityLevel");
			assert.strictEqual(buff.readUInt8(13), PriorityLevelInformation.KeepCurrent, "PLI3");
			assert.strictEqual(buff.readUInt8(14), PriorityLevelInformation.KeepCurrent, "PLI4");
			assert.strictEqual(buff.readUInt8(15), PriorityLevelInformation.KeepCurrent, "PLI5");
			assert.strictEqual(buff.readUInt8(16), PriorityLevelInformation.KeepCurrent, "PLI6");
			assert.strictEqual(buff.readUInt8(17), PriorityLevelInformation.KeepCurrent, "PLI7");
		});
	});
});
