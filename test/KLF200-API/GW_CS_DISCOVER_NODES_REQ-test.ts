"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ControllerCopyMode, GW_CS_CONTROLLER_COPY_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_CS_CONTROLLER_COPY_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_CS_CONTROLLER_COPY_REQ(ControllerCopyMode.ReceivingConfigurationMode));
		});

		it("should write the controller copy mode at the right position", function () {
			const result = new GW_CS_CONTROLLER_COPY_REQ(ControllerCopyMode.ReceivingConfigurationMode);
			assert.ok(result instanceof GW_CS_CONTROLLER_COPY_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 1);
		});
	});
});
