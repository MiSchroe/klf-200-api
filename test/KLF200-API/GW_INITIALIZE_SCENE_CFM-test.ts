"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_INITIALIZE_SCENE_CFM, InitializeSceneConfirmationStatus } from "../../src";

describe("KLF200-API", function () {
	describe("GW_INITIALIZE_SCENE_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
				assert.doesNotThrow(() => new GW_INITIALIZE_SCENE_CFM(data));
			});

			it("should return the status", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CFM(data);
				assert.strictEqual(result.Status, InitializeSceneConfirmationStatus.OK);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Empty system table.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x01]);
				const result = new GW_INITIALIZE_SCENE_CFM(data);
				assert.strictEqual(result.getError(), "Empty system table.");
			});

			it("should return 'Out of storage for scene.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x02]);
				const result = new GW_INITIALIZE_SCENE_CFM(data);
				assert.strictEqual(result.getError(), "Out of storage for scene.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x01, 0x03]);
				const result = new GW_INITIALIZE_SCENE_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 3.");
			});
		});
	});
});
