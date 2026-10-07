"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_SCENE_LIST_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_SCENE_LIST_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x06, 0x04, 0x0d, 42]);
				assert.doesNotThrow(() => new GW_GET_SCENE_LIST_CFM(data));
			});

			it("should return the number of scenes", function () {
				const data = Buffer.from([0x06, 0x04, 0x0d, 42]);
				const result = new GW_GET_SCENE_LIST_CFM(data);
				assert.strictEqual(result.NumberOfScenes, 42);
			});
		});
	});
});
