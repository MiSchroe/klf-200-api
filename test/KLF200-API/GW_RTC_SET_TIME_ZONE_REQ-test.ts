"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_RTC_SET_TIME_ZONE_REQ, readZString } from "../../src";
describe("KLF200-API", function () {
	describe("GW_RTC_SET_TIME_ZONE_REQ", function () {
		const testTimeZone = ":GMT:GMT+1:0060:(1990)040102-0:100102-0";
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_RTC_SET_TIME_ZONE_REQ(testTimeZone));
		});

		it("should write the correct time zone", function () {
			const result = new GW_RTC_SET_TIME_ZONE_REQ(testTimeZone);
			assert.ok(result instanceof GW_RTC_SET_TIME_ZONE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(readZString(buff.subarray(3, 67)), testTimeZone);
		});
	});
});
