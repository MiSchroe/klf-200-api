"use strict";

import { expect } from "chai";
import "mocha";
import { GW_GET_STATE_CFM, GatewayState, GatewaySubState } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_STATE_CFM", function () {
		describe("Constructor", function () {
			const data = Buffer.from([9, 0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]);
			it("should create without error", function () {
				expect(() => new GW_GET_STATE_CFM(data)).not.to.throw();
			});

			it("should return the correct property values", function () {
				const result = new GW_GET_STATE_CFM(data);
				expect(result.GatewayState).to.equal(GatewayState.GatewayMode_WithActuatorNodes, "GatewayState wrong.");
				expect(result.GatewaySubState).to.equal(GatewaySubState.RunningCommand, "GatewaySubState wrong.");
				expect(result.StateData.readUInt32BE(0)).to.equal(0, "StateData wrong.");
			});
		});
	});
});
