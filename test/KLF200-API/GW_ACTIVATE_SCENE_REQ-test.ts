"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_ACTIVATE_SCENE_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_ACTIVATE_SCENE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_ACTIVATE_SCENE_REQ(1));
		});

		it("should create the right object with default values", function () {
			const result = new GW_ACTIVATE_SCENE_REQ(1);
			assert.ok(result instanceof GW_ACTIVATE_SCENE_REQ);
			assert.ok("SessionID" in result);
			assert.strictEqual(result.SceneID, 1);
			assert.strictEqual(result.PriorityLevel, 3);
			assert.strictEqual(result.CommandOriginator, 1);
			assert.strictEqual(result.Velocity, 0);
		});
	});
});
