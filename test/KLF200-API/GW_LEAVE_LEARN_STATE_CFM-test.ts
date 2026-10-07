"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_INVERSE_STATUS, GW_LEAVE_LEARN_STATE_CFM } from "../../src";

describe("KLF200-API", function () {
	describe("GW_LEAVE_LEARN_STATE_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x04, 0x00, 0x0f, 0x01]);
				assert.doesNotThrow(() => new GW_LEAVE_LEARN_STATE_CFM(data));
			});

			it("should return the status", function () {
				const data = Buffer.from([0x04, 0x00, 0x0f, 0x01]);
				const result = new GW_LEAVE_LEARN_STATE_CFM(data);
				assert.strictEqual(result.Status, GW_INVERSE_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw 'No error.'", function () {
				const data = Buffer.from([0x04, 0x00, 0x0f, 0x01]);
				const result = new GW_LEAVE_LEARN_STATE_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x04, 0x00, 0x0f, 0x00]);
				const result = new GW_LEAVE_LEARN_STATE_CFM(data);
				assert.strictEqual(result.getError(), "Request failed.");
			});

			it("should return 'Unknown error.'", function () {
				const data = Buffer.from([0x04, 0x00, 0x0f, 0xff]);
				const result = new GW_LEAVE_LEARN_STATE_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 255.");
			});
		});
	});
});
