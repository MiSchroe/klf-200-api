"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ControllerCopyMode, GW_CS_CONTROLLER_COPY_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_CONTROLLER_COPY_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x02, 0x01]);
				assert.doesNotThrow(() => new GW_CS_CONTROLLER_COPY_NTF(data));
			});

			it("should return the Controller Copy Mode", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x01, 0x04]);
				const result = new GW_CS_CONTROLLER_COPY_NTF(data);
				assert.strictEqual(result.ControllerCopyMode, ControllerCopyMode.ReceivingConfigurationMode);
			});

			it("should return the Controller Copy Status", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x02, 0x01]);
				const result = new GW_CS_CONTROLLER_COPY_NTF(data);
				assert.strictEqual(result.ControllerCopyStatus, 0x01);
			});
		});
	});
});
