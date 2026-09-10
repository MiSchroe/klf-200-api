"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_WINK_SEND_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_WINK_SEND_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x03, 0x0a, 0x47, 0x11]);
				assert.doesNotThrow(() => new GW_WINK_SEND_NTF(data));
			});

			it("should return the session ID", function () {
				const data = Buffer.from([0x05, 0x03, 0x0a, 0x47, 0x11]);
				const result = new GW_WINK_SEND_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});
		});
	});
});
