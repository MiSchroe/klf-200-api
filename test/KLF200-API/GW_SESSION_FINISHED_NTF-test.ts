"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SESSION_FINISHED_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_SESSION_FINISHED_NTF", function () {
		describe("Constructor", function () {
			const data = Buffer.from([5, 0x03, 0x04, 0x47, 0x11]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_SESSION_FINISHED_NTF(data));
			});

			it("should return the session ID", function () {
				const result = new GW_SESSION_FINISHED_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});
		});
	});
});
