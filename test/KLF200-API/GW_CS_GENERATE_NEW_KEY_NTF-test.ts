"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_RECEIVE_KEY_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_RECEIVE_KEY_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([
					56, 0x01, 0x10,
					// Status
					0,
					// Key changed
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Key not changed
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				assert.doesNotThrow(() => new GW_CS_RECEIVE_KEY_NTF(data));
			});

			it("should return the ChangeKeyStatus", function () {
				const data = Buffer.from([
					56, 0x01, 0x10,
					// Status
					0,
					// Key changed
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Key not changed
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const result = new GW_CS_RECEIVE_KEY_NTF(data);
				assert.strictEqual(result.ChangeKeyStatus, 0);
			});

			it("should return the changed nodes", function () {
				const data = Buffer.from([
					56, 0x01, 0x10,
					// Status
					0,
					// Key changed
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Key not changed
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const result = new GW_CS_RECEIVE_KEY_NTF(data);
				assert.ok(result.KeyChangedNodes instanceof Array);
				assert.deepStrictEqual([...result.KeyChangedNodes].sort(), [...[0, 9]].sort());
			});

			it("should return the unchanged nodes", function () {
				const data = Buffer.from([
					56, 0x01, 0x10,
					// Status
					0,
					// Key changed
					1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Key not changed
					4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const result = new GW_CS_RECEIVE_KEY_NTF(data);
				assert.ok(result.KeyNotChangedNodes instanceof Array);
				assert.deepStrictEqual([...result.KeyNotChangedNodes].sort(), [...[2, 11]].sort());
			});
		});
	});
});
