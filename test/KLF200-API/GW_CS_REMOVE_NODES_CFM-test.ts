"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_REMOVE_NODES_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_REMOVE_NODES_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x01, 0x07, 0x01]);
				assert.doesNotThrow(() => new GW_CS_REMOVE_NODES_CFM(data));
			});

			it("should return scene deleted as true", function () {
				const data = Buffer.from([0x04, 0x01, 0x07, 0x01]);
				const result = new GW_CS_REMOVE_NODES_CFM(data);
				assert.strictEqual(result.SceneDeleted, true);
			});
		});
	});
});
