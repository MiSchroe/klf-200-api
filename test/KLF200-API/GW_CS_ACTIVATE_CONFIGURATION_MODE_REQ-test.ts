"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ([0, 1, 2, 3]));
		});

		it("should write multiple nodes", function () {
			const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ([0, 1, 2, 3]);
			assert.ok(result instanceof GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 0b00001111);
		});
	});
});
