"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				assert.doesNotThrow(() => new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data));
			});

			it("should return the status", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.strictEqual(result.Status, 1);
			});

			it("should return the activated nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.ok(result.ActivatedNodes instanceof Array);
				assert.deepStrictEqual([...result.ActivatedNodes].sort(), [...[0, 1, 2, 3]].sort());
			});

			it("should return the no contact nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.ok(result.NoContactNodes instanceof Array);
				assert.deepStrictEqual([...result.NoContactNodes].sort(), [...[8, 9, 10, 11]].sort());
			});

			it("should return the other error nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.ok(result.OtherErrorNodes instanceof Array);
				assert.deepStrictEqual([...result.OtherErrorNodes].sort(), [...[16, 17, 18, 19]].sort());
			});
		});

		describe("getError", function () {
			it("should return the error message", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.strictEqual(result.getError(), "Error code 1.");
			});

			it("should throw if no error", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					0,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				assert.throws(() => result.getError());
			});
		});
	});
});
