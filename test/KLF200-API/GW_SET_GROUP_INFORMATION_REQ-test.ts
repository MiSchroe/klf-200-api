"use strict";

import { GW_SET_GROUP_INFORMATION_REQ, readZString, GroupType } from "../../src";
import { expect, use } from "chai";
import "mocha";
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_SET_GROUP_INFORMATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			expect(
				() => new GW_SET_GROUP_INFORMATION_REQ(42, 0x1234, "Dummy", GroupType.UserGroup, [0, 1, 2]),
			).not.to.throw();
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_GROUP_INFORMATION_REQ(42, 0x1234, "Dummy", GroupType.UserGroup, [0, 1, 2]);
			expect(result).to.be.instanceOf(GW_SET_GROUP_INFORMATION_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(3)).to.be.equal(42, "GroupID wrong.");
			expect(buff.readUInt16BE(4)).to.be.equal(0, "Order wrong.");
			expect(buff.readUInt8(6)).to.be.equal(0, "Placement wrong.");
			expect(readZString(buff.slice(7, 67))).to.be.equal("Dummy", "Name wrong.");
			expect(buff.readUInt8(71)).to.be.equal(0, "Velocity wrong.");
			expect(buff.readUInt8(72)).to.be.equal(0, "NodeVariation wrong.");
			expect(buff.readUInt8(73)).to.be.equal(GroupType.UserGroup, "GroupType wrong.");
			expect(buff.readUInt8(74)).to.be.equal(3, "Number of nodes wrong.");
			expect(buff.readUInt8(75)).to.be.equal(0b00000111, "Nodes wrong.");
			expect(buff.readUInt16BE(100)).to.be.equal(0x1234, "Revision wrong.");
		});
	});
});
