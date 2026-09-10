"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_RECORD_SCENE_NTF, RecordSceneStatus } from "../../src";

describe("KLF200-API", function () {
	describe("GW_RECORD_SCENE_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
				assert.doesNotThrow(() => new GW_RECORD_SCENE_NTF(data));
			});

			it("should return the scene ID", function () {
				const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
				const result = new GW_RECORD_SCENE_NTF(data);
				assert.strictEqual(result.SceneID, 42);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
				const result = new GW_RECORD_SCENE_NTF(data);
				assert.strictEqual(result.Status, RecordSceneStatus.OK);
			});
		});
	});
});
