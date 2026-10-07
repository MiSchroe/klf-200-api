"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_SET_CONTACT_INPUT_LINK_CFM, GW_INVERSE_STATUS } from "../../src";

describe("KLF200-API", function () {
	describe("GW_SET_CONTACT_INPUT_LINK_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0x01]);
				assert.doesNotThrow(() => new GW_SET_CONTACT_INPUT_LINK_CFM(data));
			});

			it("should return the contact input ID", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0x01]);
				const result = new GW_SET_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.ContactInputID, 7);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0x01]);
				const result = new GW_SET_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.Status, GW_INVERSE_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw 'No error.'", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0x01]);
				const result = new GW_SET_CONTACT_INPUT_LINK_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0x00]);
				const result = new GW_SET_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.getError(), "Request failed.");
			});

			it("should return 'Unknown error.'", function () {
				const data = Buffer.from([0x05, 0x04, 0x63, 0x07, 0xff]);
				const result = new GW_SET_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 255.");
			});
		});
	});
});
