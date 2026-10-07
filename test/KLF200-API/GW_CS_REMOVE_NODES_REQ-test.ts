"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_REMOVE_NODES_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_CS_REMOVE_NODES_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_CS_REMOVE_NODES_REQ([42]));
		});

		it("should create the right object with the bit for node 42 set", function () {
			const result = new GW_CS_REMOVE_NODES_REQ([42]);
			assert.ok(result instanceof GW_CS_REMOVE_NODES_REQ);
			assert.ok("Nodes" in result);
			assert.strictEqual(result.Data.readUInt8(8), 0b00000100, `Data: ${result.Data.toString("hex")}`);
		});
	});
});
