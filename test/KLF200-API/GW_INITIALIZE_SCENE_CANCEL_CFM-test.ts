"use strict";

import { expect } from "chai";
import "mocha";
import { GW_INITIALIZE_SCENE_CANCEL_CFM, GW_COMMON_STATUS } from "../../src";

describe("KLF200-API", function () {
	describe("GW_INITIALIZE_SCENE_CANCEL_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				expect(() => new GW_INITIALIZE_SCENE_CANCEL_CFM(data)).not.to.throw();
			});

			it("should return the status", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				expect(result.Status).to.equal(GW_COMMON_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x00]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				expect(() => result.getError()).to.throw();
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x01]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				expect(result.getError()).to.equal("Request failed.");
			});

			it("should return 'Invalid scene ID.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x02]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				expect(result.getError()).to.equal("Invalid scene ID.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x04, 0x04, 0x04, 0x03]);
				const result = new GW_INITIALIZE_SCENE_CANCEL_CFM(data);
				expect(result.getError()).to.equal("Unknown error 3.");
			});
		});
	});
});
