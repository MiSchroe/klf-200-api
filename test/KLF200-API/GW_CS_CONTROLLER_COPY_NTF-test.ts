"use strict";

import { expect } from "chai";
import "mocha";
import { GW_CS_CONTROLLER_COPY_NTF, ControllerCopyMode } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_CONTROLLER_COPY_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x02, 0x01]);
				expect(() => new GW_CS_CONTROLLER_COPY_NTF(data)).not.to.throw();
			});

			it("should return the Controller Copy Mode", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x01, 0x04]);
				const result = new GW_CS_CONTROLLER_COPY_NTF(data);
				expect(result.ControllerCopyMode).to.equal(ControllerCopyMode.ReceivingConfigurationMode);
			});

			it("should return the Controller Copy Status", function () {
				const data = Buffer.from([0x05, 0x01, 0x0c, 0x02, 0x01]);
				const result = new GW_CS_CONTROLLER_COPY_NTF(data);
				expect(result.ControllerCopyStatus).to.equal(0x01);
			});
		});
	});
});
