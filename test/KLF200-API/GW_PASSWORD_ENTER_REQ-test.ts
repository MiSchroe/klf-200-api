"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_PASSWORD_ENTER_REQ } from "../../src/KLF200-API/GW_PASSWORD_ENTER_REQ";
describe("KLF200-API", function () {
	describe("GW_PASSWORD_ENTER_REQ", function () {
		it("should return the provided password.", function () {
			// deepcode ignore NoHardcodedPasswords/test: Used in a test-case only
			const password = "velux123";
			const passwordBuffer = Buffer.from(password, "utf8");
			const expectedBuffer = Buffer.alloc(32);
			passwordBuffer.copy(expectedBuffer);

			const result = new GW_PASSWORD_ENTER_REQ(password);
			assert.ok(result instanceof GW_PASSWORD_ENTER_REQ);
			assert.deepStrictEqual(result.Data.subarray(3), Buffer.from(expectedBuffer));
		});

		it("should return the provided password, if the password length equals 32 bytes.", function () {
			// deepcode ignore NoHardcodedPasswords/test: Used in a test-case only
			const password = "12345678901234567890123456789012"; //DevSkim: ignore DS117838,DS173237
			const passwordBuffer = Buffer.from(password, "utf8");
			const expectedBuffer = Buffer.alloc(32);
			passwordBuffer.copy(expectedBuffer);

			const result = new GW_PASSWORD_ENTER_REQ(password);
			assert.ok(result instanceof GW_PASSWORD_ENTER_REQ);
			assert.deepStrictEqual(result.Data.subarray(3), Buffer.from(expectedBuffer));
		});

		it("should throw an exception if the password is to long.", function () {
			// deepcode ignore NoHardcodedPasswords/test: Used in a test-case only
			const password = "123456789012345678901234567890123"; //DevSkim: ignore DS117838,DS173237

			assert.throws(() => new GW_PASSWORD_ENTER_REQ(password));
		});
	});
});
