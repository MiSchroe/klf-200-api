"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_DELETE_GROUP_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_DELETE_GROUP_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_DELETE_GROUP_REQ(42));
		});

		it("should write the group id at the right position", function () {
			const result = new GW_DELETE_GROUP_REQ(42);
			assert.ok(result instanceof GW_DELETE_GROUP_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 42);
		});
	});
});
