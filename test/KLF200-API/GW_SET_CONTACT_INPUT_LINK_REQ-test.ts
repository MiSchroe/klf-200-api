"use strict";

import { GW_SET_CONTACT_INPUT_LINK_REQ, ContactInputAssignment, Velocity, PriorityLevelInformation } from "../../src";
import { expect, use } from "chai";
import "mocha";
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_SET_CONTACT_INPUT_LINK_REQ", function () {
		it("shouldn't throw an error on create", function () {
			expect(
				() =>
					new GW_SET_CONTACT_INPUT_LINK_REQ(
						3,
						ContactInputAssignment.NodeMode,
						4,
						5,
						0xc3ff,
						Velocity.Fast,
						42,
					),
			).not.to.throw();
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_CONTACT_INPUT_LINK_REQ(
				3,
				ContactInputAssignment.NodeMode,
				4,
				5,
				0xc3ff,
				Velocity.Fast,
				42,
			);
			expect(result).to.be.instanceOf(GW_SET_CONTACT_INPUT_LINK_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(3)).to.be.equal(3, "ContactInputID");
			expect(buff.readUInt8(4)).to.be.equal(ContactInputAssignment.NodeMode, "ContactInputAssignment");
			expect(buff.readUInt8(18)).to.be.equal(4, "SuccessOutputID");
			expect(buff.readUInt8(19)).to.be.equal(5, "ErrorOutpuID");
			expect(buff.readUInt16BE(9)).to.be.equal(0xc3ff, "Position");
			expect(buff.readUInt8(11)).to.be.equal(Velocity.Fast, "Velocity");
			expect(buff.readUInt8(5)).to.be.equal(42, "ActionID");
			expect(buff.readUInt8(7)).to.be.equal(3, "PriorityLevel");
			expect(buff.readUInt8(6)).to.be.equal(1, "CommandOriginator");
			expect(buff.readUInt8(8)).to.be.equal(0, "ParameterActive");
			expect(buff.readUInt8(12)).to.be.equal(0, "LockPriorityLevel");
			expect(buff.readUInt8(13)).to.be.equal(PriorityLevelInformation.KeepCurrent, "PLI3");
			expect(buff.readUInt8(14)).to.be.equal(PriorityLevelInformation.KeepCurrent, "PLI4");
			expect(buff.readUInt8(15)).to.be.equal(PriorityLevelInformation.KeepCurrent, "PLI5");
			expect(buff.readUInt8(16)).to.be.equal(PriorityLevelInformation.KeepCurrent, "PLI6");
			expect(buff.readUInt8(17)).to.be.equal(PriorityLevelInformation.KeepCurrent, "PLI7");
		});
	});
});
