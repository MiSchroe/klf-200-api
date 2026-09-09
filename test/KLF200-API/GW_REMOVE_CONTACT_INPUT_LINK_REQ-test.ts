"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_REMOVE_CONTACT_INPUT_LINK_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_REMOVE_CONTACT_INPUT_LINK_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_REMOVE_CONTACT_INPUT_LINK_REQ(3));
		});

		it("should write the input link ID", function () {
			const result = new GW_REMOVE_CONTACT_INPUT_LINK_REQ(3);
			assert.ok(result instanceof GW_REMOVE_CONTACT_INPUT_LINK_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), 3);
		});
	});
});
