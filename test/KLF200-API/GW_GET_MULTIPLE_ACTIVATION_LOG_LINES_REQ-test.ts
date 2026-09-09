"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ", function () {
		const testDate = new Date();
		testDate.setMilliseconds(0); // We don't want to hassle with fraction numbers here.
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ(testDate));
		});

		it("should write the correct date", function () {
			const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ(testDate);
			assert.ok(result instanceof GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt32BE(3), testDate.valueOf() / 1000);
		});
	});
});
