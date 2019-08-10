'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_LOCAL_TIME_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_LOCAL_TIME_CFM", function() {
        describe("Constructor", function() {
            const testDate = new Date(2019, 6, 9, 12, 34, 56);
            const testDateDOY = (Date.UTC(testDate.getFullYear(), testDate.getMonth(), testDate.getDate()) - Date.UTC(testDate.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
            const data = Buffer.from([18, 0x20, 0x05,
                // Test date split by bytes
                ((testDate.valueOf() / 1000) >>> 24) & 0xFF,
                ((testDate.valueOf() / 1000) >>> 16) & 0xFF,
                ((testDate.valueOf() / 1000) >>> 8) & 0xFF,
                ((testDate.valueOf() / 1000) >>> 0) & 0xFF,
                testDate.getSeconds(),
                testDate.getMinutes(),
                testDate.getHours(),
                testDate.getDate(),
                testDate.getMonth(),
                (testDate.getFullYear() >>> 8) & 0xFF,
                (testDate.getFullYear() >>> 0) & 0xFF,
                testDate.getDay(),
                (testDateDOY >>> 8) & 0xFF,
                (testDateDOY >>> 0) & 0xFF,
                1   // DST
            ]);
            it("should create without error", function() {
                expect(() => new GW_GET_LOCAL_TIME_CFM(data)).not.to.throw();
            });

            it("should return the UTC time", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.UTCTime).to.deep.equal(testDate);
            });

            it("should return the seconds", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Second).to.equal(testDate.getSeconds());
            });

            it("should return the minutes", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Minute).to.equal(testDate.getMinutes());
            });

            it("should return the hours", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Hour).to.equal(testDate.getHours());
            });

            it("should return the day of month", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.DayOfMonth).to.equal(testDate.getDate());
            });

            it("should return the month", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Month).to.equal(testDate.getMonth());
            });

            it("should return the year", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Year).to.equal(testDate.getFullYear());
            });

            it("should return the weekday", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.Weekday).to.equal(testDate.getDay());
            });

            it("should return the day of year", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.DayOfYear).to.equal(testDateDOY);
            });

            it("should return the daylight saving flag", function() {
                const result = new GW_GET_LOCAL_TIME_CFM(data);
                expect(result.DaylightSavingFlag).to.equal(1);
            });
        });
    });
});