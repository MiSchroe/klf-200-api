"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_ACTIVATION_LOG_HEADER_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_ACTIVATION_LOG_HEADER_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x07, 0x05, 0x01, 0x98, 0x76, 0x12, 0x34]);
				assert.doesNotThrow(() => new GW_GET_ACTIVATION_LOG_HEADER_CFM(data));
			});

			it("should return the correct max line count and current line count values", function () {
				const data = Buffer.from([0x07, 0x05, 0x01, 0x98, 0x76, 0x12, 0x34]);
				const result = new GW_GET_ACTIVATION_LOG_HEADER_CFM(data);
				assert.strictEqual(result.MaxLineCount, 0x9876);
				assert.strictEqual(result.LineCount, 0x1234);
			});
		});
	});
});
