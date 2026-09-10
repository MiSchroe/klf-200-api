"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_VERSION_CFM, SoftwareVersion } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_VERSION_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
				assert.doesNotThrow(() => new GW_GET_VERSION_CFM(data));
			});

			it("should return the Software Version", function () {
				const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
				const result = new GW_GET_VERSION_CFM(data);
				assert.deepStrictEqual(result.SoftwareVersion, new SoftwareVersion(2, 3, 4, 71, 5, 6));
			});

			it("should return the Hardware Version", function () {
				const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
				const result = new GW_GET_VERSION_CFM(data);
				assert.strictEqual(result.HardwareVersion, 1);
			});

			it("should return the Product Group", function () {
				const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
				const result = new GW_GET_VERSION_CFM(data);
				assert.strictEqual(result.ProductGroup, 14);
			});

			it("should return the Product Type", function () {
				const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
				const result = new GW_GET_VERSION_CFM(data);
				assert.strictEqual(result.ProductType, 3);
			});
		});
	});

	describe("SoftwareVersion", function () {
		describe("Constructur", function () {
			it("should create without error", function () {
				assert.doesNotThrow(() => new SoftwareVersion(2, 3, 4, 71, 5, 6));
			});
		});

		describe("toString", function () {
			it("should return 2.3.4.71.5.6", function () {
				const result = new SoftwareVersion(2, 3, 4, 71, 5, 6).toString();
				assert.strictEqual(result, "2.3.4.71.5.6");
			});
		});
	});
});
