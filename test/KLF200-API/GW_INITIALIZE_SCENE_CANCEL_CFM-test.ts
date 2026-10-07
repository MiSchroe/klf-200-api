"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_COMMON_STATUS, GW_INITIALIZE_SCENE_CANCEL_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_INITIALIZE_SCENE_CANCEL_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				assert.doesNotThrow(() => new GW_INITIALIZE_SCENE_CANCEL_CFM(data));
			});

			it("should return the status", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				assert.strictEqual(result.Status, GW_COMMON_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x01]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				assert.strictEqual(result.getError(), "Request failed.");
			});

			it("should return 'Invalid scene ID.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x02]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				assert.strictEqual(result.getError(), "Invalid scene ID.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x03]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 3.");
			});
		});
	});
});
