"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_COMMON_STATUS, GW_GET_ALL_NODES_INFORMATION_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_ALL_NODES_INFORMATION_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				assert.doesNotThrow(() => new GW_GET_ALL_NODES_INFORMATION_CFM(data));
			});

			it("should return the number of nodes", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				assert.strictEqual(result.NumberOfNode, 42);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				assert.strictEqual(result.Status, GW_COMMON_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x00, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'System table empty.'", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x01, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				assert.strictEqual(result.getError(), "System table empty.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x05, 0x02, 0x03, 0x03, 42]);
				const result = new GW_GET_ALL_NODES_INFORMATION_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 3.");
			});
		});
	});
});
