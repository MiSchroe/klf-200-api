"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_REMOVE_CONTACT_INPUT_LINK_CFM, GW_INVERSE_STATUS } from "../../src";

describe("KLF200-API", function () {
	describe("GW_REMOVE_CONTACT_INPUT_LINK_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
				assert.doesNotThrow(() => new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data));
			});

			it("should return the contact ID", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
				const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.ContactInputID, 4);
			});

			it("should return the status", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
				const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.Status, GW_INVERSE_STATUS.SUCCESS);
			});
		});

		describe("getError", function () {
			it("should throw No error", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
				const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
				assert.throws(() => result.getError());
			});

			it("should return 'Request failed.'", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x00]);
				const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.getError(), "Request failed.");
			});

			it("should return 'Unknown error 3.'", function () {
				const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x03]);
				const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
				assert.strictEqual(result.getError(), "Unknown error 3.");
			});
		});
	});
});
