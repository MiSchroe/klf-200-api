"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_ACTIVATION_LOG_LINE_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_ACTIVATION_LOG_LINE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_GET_ACTIVATION_LOG_LINE_REQ(42));
		});

		it("should write the line number at the right position", function () {
			const result = new GW_GET_ACTIVATION_LOG_LINE_REQ(42);
			assert.ok(result instanceof GW_GET_ACTIVATION_LOG_LINE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt16BE(3), 42);
		});
	});
});
