"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_RECORD_SCENE_REQ, readZString } from "../../src";
describe("KLF200-API", function () {
	describe("GW_RECORD_SCENE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_RECORD_SCENE_REQ("Dummy"));
		});

		it("should write the correct scene name", function () {
			const result = new GW_RECORD_SCENE_REQ("Dummy");
			assert.ok(result instanceof GW_RECORD_SCENE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(readZString(buff.subarray(3, 67)), "Dummy");
		});

		it("shouldn't throw an error with scene name at size of 64 chars", function () {
			assert.doesNotThrow(
				() => new GW_RECORD_SCENE_REQ("0123456789012345678901234567890123456789012345678901234567890123"),
			); //DevSkim: ignore DS173237
		});

		it("should throw an error with old passwords at size greater than 64 chars", function () {
			assert.throws(
				() => new GW_RECORD_SCENE_REQ("01234567890123456789012345678901234567890123456789012345678901234"),
			); //DevSkim: ignore DS173237
		});
	});
});
