"use strict";

import { GW_REMOVE_CONTACT_INPUT_LINK_REQ } from "../../src";
import { expect, use } from "chai";
import "mocha";
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_REMOVE_CONTACT_INPUT_LINK_REQ", function () {
		it("shouldn't throw an error on create", function () {
			expect(() => new GW_REMOVE_CONTACT_INPUT_LINK_REQ(3)).not.to.throw();
		});

		it("should write the input link ID", function () {
			const result = new GW_REMOVE_CONTACT_INPUT_LINK_REQ(3);
			expect(result).to.be.instanceOf(GW_REMOVE_CONTACT_INPUT_LINK_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(3)).to.be.equal(3);
		});
	});
});
