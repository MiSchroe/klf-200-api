"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_COMMAND_REMAINING_TIME_NTF, ParameterActive } from "../../src";

describe("KLF200-API", function () {
	describe("GW_COMMAND_REMAINING_TIME_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x12, 0x02, 0x00, 0x2a]);
				assert.doesNotThrow(() => new GW_COMMAND_REMAINING_TIME_NTF(data));
			});

			it("should return the session ID", function () {
				const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x12, 0x02, 0x00, 0x2a]);
				const result = new GW_COMMAND_REMAINING_TIME_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the node parameter FP2", function () {
				const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x12, 0x02, 0x00, 0x2a]);
				const result = new GW_COMMAND_REMAINING_TIME_NTF(data);
				assert.strictEqual(result.NodeParameter, ParameterActive.FP2);
			});

			it("should return the 42 seconds remaining time", function () {
				const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x12, 0x02, 0x00, 0x2a]);
				const result = new GW_COMMAND_REMAINING_TIME_NTF(data);
				assert.strictEqual(result.RemainingTime, 42);
			});
		});
	});
});
