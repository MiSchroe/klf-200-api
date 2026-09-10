"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SCENE_INFORMATION_CHANGED_NTF, SceneChangeType } from "../../src";

describe("KLF200-API", function () {
	describe("GW_SCENE_INFORMATION_CHANGED_NTF", function () {
		describe("Constructor", function () {
			const data = Buffer.from([5, 0x04, 0x19, 0x01, 42]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_SCENE_INFORMATION_CHANGED_NTF(data));
			});

			it("should return the scenes ID", function () {
				const result = new GW_SCENE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.SceneID, 42);
			});

			it("should return the scenes change type", function () {
				const result = new GW_SCENE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.SceneChangeType, SceneChangeType.Modified);
			});
		});
	});
});
