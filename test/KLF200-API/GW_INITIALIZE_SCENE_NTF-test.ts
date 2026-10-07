"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_INITIALIZE_SCENE_NTF, InitializeSceneNotificationStatus } from "../../src";

describe("KLF200-API", function () {
	describe("GW_INITIALIZE_SCENE_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				0x04, 0x04, 0x02, 
                // Status
                0x02,
                // Failed Nodes
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_INITIALIZE_SCENE_NTF(data));
			});

			it("should return the status", function () {
				const result = new GW_INITIALIZE_SCENE_NTF(data);
				assert.strictEqual(result.Status, InitializeSceneNotificationStatus.Error);
			});

			it("should return the failed nodes", function () {
				const result = new GW_INITIALIZE_SCENE_NTF(data);
				assert.ok(result.FailedNodes instanceof Array);
				assert.deepStrictEqual(
					[...result.FailedNodes].sort(),
					[...[0, 8, 40, 48, 80, 88, 120, 128, 160, 168]].sort(),
				);
			});
		});
	});
});
