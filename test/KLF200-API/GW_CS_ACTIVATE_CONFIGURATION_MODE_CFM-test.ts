"use strict";

import { GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM } from "../../src";
import { expect } from "chai";
import "mocha";

describe("KLF200-API", function () {
	describe("GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				expect(() => new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data)).not.to.throw();
			});

			it("should return the status", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(result.Status).to.equal(1);
			});

			it("should return the activated nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(result.ActivatedNodes).to.be.an.instanceOf(Array).and.have.members([0, 1, 2, 3]);
			});

			it("should return the no contact nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(result.NoContactNodes).to.be.an.instanceOf(Array).and.have.members([8, 9, 10, 11]);
			});

			it("should return the other error nodes", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(result.OtherErrorNodes).to.be.an.instanceOf(Array).and.have.members([16, 17, 18, 19]);
			});
		});

		describe("getError", function () {
			it("should return the error message", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					1,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(result.getError()).to.equal("Error code 1.");
			});

			it("should throw if no error", function () {
				const data = Buffer.from([
					82, 0x01, 0x1a,
					// Activated
					15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// No Contact
					0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Other error
					0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Status
					0,
				]);
				const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM(data);
				expect(() => result.getError()).to.throw();
			});
		});
	});
});
