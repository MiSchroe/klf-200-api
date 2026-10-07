"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_STATUS_REQUEST_CFM, CommandStatus } from "../../src";

describe("KLF200-API", function () {
	describe("GW_STATUS_REQUEST_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
				assert.doesNotThrow(() => new GW_STATUS_REQUEST_CFM(data));
			});

			it("should return the status", function () {
				const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
				const result = new GW_STATUS_REQUEST_CFM(data);
				assert.strictEqual(result.CommandStatus, CommandStatus.CommandAccepted);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
				const result = new GW_STATUS_REQUEST_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Command rejected.'", function () {
				const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x00]);
				const result = new GW_STATUS_REQUEST_CFM(data);
				assert.strictEqual(result.getError(), "Command rejected.");
			});

			it("should return 'Unknown error 2.'", function () {
				const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x02]);
				const result = new GW_STATUS_REQUEST_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 2.");
			});
		});
	});
});
