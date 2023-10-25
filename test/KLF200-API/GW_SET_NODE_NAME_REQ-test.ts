"use strict";

import { expect, use } from "chai";
import chaibytes from "chai-bytes";
import "mocha";
import { GW_SET_NODE_NAME_REQ, readZString } from "../../src";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_SET_NODE_NAME_REQ", function () {
		it("shouldn't throw an error on create", function () {
			expect(() => new GW_SET_NODE_NAME_REQ(42, "Dummy")).not.to.throw();
		});

		it("should write the correct node name", function () {
			const result = new GW_SET_NODE_NAME_REQ(42, "Dummy");
			expect(result).to.be.instanceOf(GW_SET_NODE_NAME_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(3)).to.be.equal(42, "SceneID wrong.");
			expect(readZString(buff.subarray(4, 68))).to.be.equal("Dummy", "Name wrong.");
		});

		it("shouldn't throw an error with scene name at size of 64 chars", function () {
			expect(
				() => new GW_SET_NODE_NAME_REQ(42, "0123456789012345678901234567890123456789012345678901234567890123"),
			).not.to.throw(); //DevSkim: ignore DS173237
		});

		it("should throw an error with scene name at size greater than 64 chars", function () {
			expect(
				() => new GW_SET_NODE_NAME_REQ(42, "01234567890123456789012345678901234567890123456789012345678901234"),
			).to.throw(); //DevSkim: ignore DS173237
		});
	});
});
