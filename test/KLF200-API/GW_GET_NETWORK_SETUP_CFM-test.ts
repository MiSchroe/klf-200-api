"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_NETWORK_SETUP_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_NETWORK_SETUP_CFM", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				16, 0x00, 0xe1,
                // IP address
                1, 2, 3, 4,
                // Mask
                5, 6, 7, 8,
                // Gateway
                9, 10, 11, 12,
                // DHCP
                1
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_NETWORK_SETUP_CFM(data));
			});

			it("should return the IP address", function () {
				const result = new GW_GET_NETWORK_SETUP_CFM(data);
				assert.strictEqual(result.IPAddress, "1.2.3.4");
			});

			it("should return the mask", function () {
				const result = new GW_GET_NETWORK_SETUP_CFM(data);
				assert.strictEqual(result.Mask, "5.6.7.8");
			});

			it("should return the gateway", function () {
				const result = new GW_GET_NETWORK_SETUP_CFM(data);
				assert.strictEqual(result.DefaultGateway, "9.10.11.12");
			});

			it("should return the DHCP flag", function () {
				const result = new GW_GET_NETWORK_SETUP_CFM(data);
				assert.strictEqual(result.DHCP, true);
			});
		});
	});
});
