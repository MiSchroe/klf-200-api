"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_PASSWORD_CHANGE_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_PASSWORD_CHANGE_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				35, 0x30, 0x04,
                // New password
                0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_PASSWORD_CHANGE_NTF(data));
			});

			it("should return the number of scenes", function () {
				const result = new GW_PASSWORD_CHANGE_NTF(data);
				assert.strictEqual(result.NewPassword, "12345678");
			});
		});
	});
});
