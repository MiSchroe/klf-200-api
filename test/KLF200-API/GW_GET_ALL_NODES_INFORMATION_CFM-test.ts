"use strict";

import { expect } from "chai";
import "mocha";
import { GW_COMMON_STATUS, GW_GET_ALL_NODES_INFORMATION_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_ALL_NODES_INFORMATION_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				expect(() => new GW_GET_ALL_NODES_INFORMATION_CFM(data)).not.to.throw();
			});

			it("should return the number of nodes", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				expect(result.NumberOfNode).to.equal(42);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				expect(result.Status).to.equal(GW_COMMON_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				expect(() => result.getError()).to.throw();
			});

			it("should return 'System table empty.'", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x01, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				expect(result.getError()).to.equal("System table empty.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x03, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				expect(result.getError()).to.equal("Unknown error 3.");
			});
		});
	});
});
