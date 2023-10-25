"use strict";

import { expect, use } from "chai";
import chaibytes from "chai-bytes";
import "mocha";
import { GW_RTC_SET_TIME_ZONE_REQ, readZString } from "../../src";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_RTC_SET_TIME_ZONE_REQ", function () {
		const testTimeZone = ":GMT:GMT+1:0060:(1990)040102-0:100102-0";
		it("shouldn't throw an error on create", function () {
			expect(() => new GW_RTC_SET_TIME_ZONE_REQ(testTimeZone)).not.to.throw();
		});

		it("should write the correct time zone", function () {
			const result = new GW_RTC_SET_TIME_ZONE_REQ(testTimeZone);
			expect(result).to.be.instanceOf(GW_RTC_SET_TIME_ZONE_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(readZString(buff.subarray(3, 67))).to.be.equal(testTimeZone);
		});
	});
});
