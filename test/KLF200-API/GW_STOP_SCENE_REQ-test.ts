"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_STOP_SCENE_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_STOP_SCENE_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_STOP_SCENE_REQ(42));
		});

		it("should write the correct default values", function () {
			const result = new GW_STOP_SCENE_REQ(42);
			assert.ok(result instanceof GW_STOP_SCENE_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "CommandOriginator wrong.");
			assert.strictEqual(buff.readUInt8(6), 3, "PriorityLevel wrong.");
			assert.strictEqual(buff.readUInt8(7), 42, "SceneID wrong.");
		});
	});
});
