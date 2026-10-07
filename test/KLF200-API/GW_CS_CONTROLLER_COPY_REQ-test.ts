"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ActuatorType, GW_CS_DISCOVER_NODES_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_CS_DISCOVER_NODES_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_CS_DISCOVER_NODES_REQ());
		});

		it("should write the node type at the right position", function () {
			const result = new GW_CS_DISCOVER_NODES_REQ(ActuatorType.Blind);
			assert.ok(result instanceof GW_CS_DISCOVER_NODES_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(3), ActuatorType.Blind);
		});

		it("should default to ActuatorType.NO_TYPE for node type", function () {
			const result = new GW_CS_DISCOVER_NODES_REQ();
			assert.ok(result instanceof GW_CS_DISCOVER_NODES_REQ);
			assert.ok("NodeType" in result);
			const actuatorType = result.NodeType;
			assert.strictEqual(actuatorType, ActuatorType.NO_TYPE);
		});
	});
});
