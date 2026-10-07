"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_MODE_SEND_CFM, ModeStatus } from "../../src";

describe("KLF200-API", function () {
	describe("GW_MODE_SEND_CFM", function () {
		describe("Constructor", function () {
			const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x00]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_MODE_SEND_CFM(data));
			});

			it("should return the session ID", function () {
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the status", function () {
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.ModeStatus, ModeStatus.OK);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x00]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Command rejected.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x01]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Command rejected.");
			});

			it("should return 'Unknown client ID.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x02]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Unknown client ID.");
			});

			it("should return 'Session ID in use.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x03]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Session ID in use.");
			});

			it("should return 'Busy.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x04]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Busy.");
			});

			it("should return 'Invalid parameter value.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x05]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Invalid parameter value.");
			});

			it("should return 'Failed.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0xff]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Failed.");
			});

			it("should return 'Unknown error 254.'", function () {
				const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0xfe]);
				const result = new GW_MODE_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 254.");
			});
		});
	});
});
