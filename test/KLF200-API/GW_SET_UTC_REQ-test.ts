"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_UTC_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_UTC_REQ", function () {
		const testTime = new Date();
		testTime.setMilliseconds(0); // We don't want milliseconds
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_SET_UTC_REQ());
		});

		it("should write the correct date/time", function () {
			const result = new GW_SET_UTC_REQ(testTime);
			assert.ok(result instanceof GW_SET_UTC_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.deepStrictEqual(new Date(buff.readUInt32BE(3) * 1000), testTime);
		});
	});
});
