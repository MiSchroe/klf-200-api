"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GROUP_DELETED_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GROUP_DELETED_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x02, 0x2d, 42]);
				assert.doesNotThrow(() => new GW_GROUP_DELETED_NTF(data));
			});

			it("should return the group ID", function () {
				const data = Buffer.from([0x04, 0x02, 0x2d, 42]);
				const result = new GW_GROUP_DELETED_NTF(data);
				assert.strictEqual(result.GroupID, 42);
			});
		});
	});
});
