"use strict";

import { expect } from "chai";
import "mocha";
import { GW_WINK_SEND_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_WINK_SEND_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([0x05, 0x03, 0x0a, 0x47, 0x11]);
				expect(() => new GW_WINK_SEND_NTF(data)).not.to.throw();
			});

			it("should return the session ID", function () {
				const data = Buffer.from([0x05, 0x03, 0x0a, 0x47, 0x11]);
				const result = new GW_WINK_SEND_NTF(data);
				expect(result.SessionID).to.equal(0x4711);
			});
		});
	});
});
