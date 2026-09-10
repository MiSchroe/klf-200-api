"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_PASSWORD_CHANGE_REQ, readZString } from "../../src";
describe("KLF200-API", function () {
	describe("GW_PASSWORD_CHANGE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_PASSWORD_CHANGE_REQ("OldPass", "NewPass"));
		});

		it("should write the correct password values", function () {
			const result = new GW_PASSWORD_CHANGE_REQ("OldPass", "NewPass");
			assert.ok(result instanceof GW_PASSWORD_CHANGE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(readZString(buff.subarray(3, 35)), "OldPass", "Old password wrong.");
			assert.strictEqual(readZString(buff.subarray(35, 67)), "NewPass", "New password wrong.");
		});

		it("shouldn't throw an error with passwords at size of 32 chars", function () {
			assert.doesNotThrow(
				() =>
					new GW_PASSWORD_CHANGE_REQ("01234567890123456789012345678901", "01234567890123456789012345678901"),
			); //DevSkim: ignore DS173237
		});

		it("should throw an error with old passwords at size greater than 32 chars", function () {
			assert.throws(
				() =>
					new GW_PASSWORD_CHANGE_REQ("012345678901234567890123456789012", "01234567890123456789012345678901"),
			); //DevSkim: ignore DS173237
		});

		it("should throw an error with new passwords at size greater than 32 chars", function () {
			assert.throws(
				() =>
					new GW_PASSWORD_CHANGE_REQ("01234567890123456789012345678901", "012345678901234567890123456789012"),
			); //DevSkim: ignore DS173237
		});
	});
});
