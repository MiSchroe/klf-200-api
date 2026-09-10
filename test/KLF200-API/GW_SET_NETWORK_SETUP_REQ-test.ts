"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_NETWORK_SETUP_REQ } from "../../src";
describe("KLF200-API", function () {
	describe("GW_SET_NETWORK_SETUP_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_SET_NETWORK_SETUP_REQ(true));
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_NETWORK_SETUP_REQ(true);
			assert.ok(result instanceof GW_SET_NETWORK_SETUP_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(15), 1, "DHCP wrong.");
		});

		it("should write the correct IP addresses", function () {
			const result = new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "5.6.7.8", "9.10.11.12");
			assert.ok(result instanceof GW_SET_NETWORK_SETUP_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(15), 0, "DHCP wrong.");
			assert.strictEqual(buff.readUInt32BE(3), 0x01020304, "IPAddress wrong.");
			assert.strictEqual(buff.readUInt32BE(7), 0x05060708, "Mask wrong.");
			assert.strictEqual(buff.readUInt32BE(11), 0x090a0b0c, "DefaultGateway wrong.");
		});

		it("should throw an error on invalid IP address", function () {
			assert.throws(() => new GW_SET_NETWORK_SETUP_REQ(false, "NoIP", "5.6.7.8", "9.10.11.12"));
		});

		it("should throw an error on invalid mask address", function () {
			assert.throws(() => new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "NoIP", "9.10.11.12"));
		});

		it("should throw an error on invalid default gateway address", function () {
			assert.throws(() => new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "5.6.7.8", "NoIP"));
		});
	});
});
