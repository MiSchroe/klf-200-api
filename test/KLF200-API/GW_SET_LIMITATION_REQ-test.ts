"use strict";

import { GW_SET_LIMITATION_REQ } from "../../src";
import { expect, use } from "chai";
import "mocha";
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function () {
	describe("GW_SET_LIMITATION_REQ", function () {
		it("shouldn't throw an error on create", function () {
			expect(() => new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255)).not.to.throw();
		});

		it("should write the correct default values", function () {
			const result = new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255);
			expect(result).to.be.instanceOf(GW_SET_LIMITATION_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(5)).to.be.equal(1, "CommandOriginator wrong.");
			expect(buff.readUInt8(6)).to.be.equal(3, "PriorityLevel wrong.");
			expect(buff.readUInt8(28)).to.be.equal(0, "ParameterActive wrong.");
			expect(buff.readUInt16BE(29)).to.be.equal(0xc400, "LimitationValueMin wrong.");
			expect(buff.readUInt16BE(31)).to.be.equal(0xc2ff, "LimitationValueMax wrong.");
			expect(buff.readUInt8(33)).to.be.equal(255, "LimitationTime wrong.");
		});

		it("should write the single node", function () {
			const result = new GW_SET_LIMITATION_REQ(42, 0xc400, 0xc2ff, 255);
			expect(result).to.be.instanceOf(GW_SET_LIMITATION_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(7)).to.be.equal(1, "Number of nodes wrong.");
			expect(buff.readUInt8(8)).to.be.equal(42, "Node array wrong.");
		});

		it("should write multiple nodes", function () {
			const result = new GW_SET_LIMITATION_REQ([42, 87], 0xc400, 0xc2ff, 255);
			expect(result).to.be.instanceOf(GW_SET_LIMITATION_REQ).that.has.property("Data");
			const buff = result.Data;
			expect(buff.readUInt8(7)).to.be.equal(2, "Number of nodes wrong.");
			expect(buff.readUInt8(8)).to.be.equal(42, "Node array byte 1 wrong.");
			expect(buff.readUInt8(9)).to.be.equal(87, "Node array byte 2 wrong.");
		});

		it("shouldn't throw an error with 20 nodes", function () {
			expect(
				() =>
					new GW_SET_LIMITATION_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
						0xc400,
						0xc2ff,
						255,
					),
			).not.to.throw();
		});

		it("should throw an error with more than 20 nodes", function () {
			expect(
				() =>
					new GW_SET_LIMITATION_REQ(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
						0xc400,
						0xc2ff,
						255,
					),
			).to.throw();
		});
	});
});
