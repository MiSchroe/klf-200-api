"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_STATE_CFM, GatewayState, GatewaySubState } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_STATE_CFM", function () {
		describe("Constructor", function () {
			const data = Buffer.from([9, 0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_STATE_CFM(data));
			});

			it("should return the correct property values", function () {
				const result = new GW_GET_STATE_CFM(data);
				assert.strictEqual(
					result.GatewayState,
					GatewayState.GatewayMode_WithActuatorNodes,
					"GatewayState wrong.",
				);
				assert.strictEqual(result.GatewaySubState, GatewaySubState.RunningCommand, "GatewaySubState wrong.");
				assert.strictEqual(result.StateData.readUInt32BE(0), 0, "StateData wrong.");
			});
		});
	});
});
