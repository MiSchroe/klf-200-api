"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_WINK_SEND_CFM, GW_INVERSE_STATUS } from "../../src";

describe("KLF200-API", function () {
	describe("GW_WINK_SEND_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
				assert.doesNotThrow(() => new GW_WINK_SEND_CFM(data));
			});

			it("should return the session ID", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
				const result = new GW_WINK_SEND_CFM(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
				const result = new GW_WINK_SEND_CFM(data);
				assert.strictEqual(result.Status, GW_INVERSE_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw 'No error.'", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
				const result = new GW_WINK_SEND_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x00]);
				const result = new GW_WINK_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Request failed.");
			});

			it("should return 'Unknown error.'", function () {
				const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0xff]);
				const result = new GW_WINK_SEND_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 255.");
			});
		});
	});
});
