"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_SYSTEM_TABLE_UPDATE_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_SYSTEM_TABLE_UPDATE_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([
					55, 0x01, 0x12,
					// Added nodes
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Removed nodes
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				assert.doesNotThrow(() => new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data));
			});

			it("should return the added and removed nodes", function () {
				const data = Buffer.from([
					55, 0x01, 0x12,
					// Added nodes
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Removed nodes
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const result = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);
				assert.ok(result.AddedNodes instanceof Array);
				assert.deepStrictEqual([...result.AddedNodes].sort(), [...[0, 9]].sort());
				assert.ok(result.RemovedNodes instanceof Array);
				assert.deepStrictEqual([...result.RemovedNodes].sort(), [...[2, 11]].sort());
			});
		});
	});
});
