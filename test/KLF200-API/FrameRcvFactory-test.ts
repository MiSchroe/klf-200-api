"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FrameRcvFactory } from "../../src/KLF200-API/FrameRcvFactory";
import { GW_REBOOT_CFM } from "../../src/KLF200-API/GW_REBOOT_CFM";

describe("FrameRcvFactory", function () {
	describe("CreateRcvFrame", function () {
		it("should create a GW_REBOOT_CFM object from the provided buffer", async function () {
			const buf = Buffer.from([0x03, 0x00, 0x02]);

			const result = await FrameRcvFactory.CreateRcvFrame(buf);
			assert.ok(result instanceof GW_REBOOT_CFM);
		});

		it("should throw an error on an unknown command", async function () {
			const buf = Buffer.from([0x03, 0xff, 0xff]);

			await assert.rejects(FrameRcvFactory.CreateRcvFrame(buf));
		});
	});
});
