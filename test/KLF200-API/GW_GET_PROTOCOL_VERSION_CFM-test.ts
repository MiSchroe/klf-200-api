"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_PROTOCOL_VERSION_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_PROTOCOL_VERSION_CFM", function () {
		describe("Constructor", function () {
			const data = Buffer.from([0x07, 0x00, 0x0b, 0x12, 0x34, 0x56, 0x78]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_PROTOCOL_VERSION_CFM(data));
			});

			it("should return the line count", function () {
				const result = new GW_GET_PROTOCOL_VERSION_CFM(data);
				assert.strictEqual(result.MajorVersion, 0x1234);
			});

			it("should return the status", function () {
				const result = new GW_GET_PROTOCOL_VERSION_CFM(data);
				assert.strictEqual(result.MinorVersion, 0x5678);
			});
		});
	});
});
