"use strict";

import { expect, use } from "chai";
import chaibytes from "chai-bytes";
import { arrayToBitArray, bitArrayToArray } from "../../src/utils/BitArray";

use(chaibytes);

describe("utils", function () {
	describe("BitArray", function () {
		describe("bitArrayToArray", function () {
			it("should return an empty number array on a zero length buffer", function () {
				const buf = Buffer.alloc(0);
				const result = bitArrayToArray(buf);

				expect(result).to.be.an("array").that.is.empty;
			});

			it("should return an empty number array on a zero filled buffer", function () {
				const buf = Buffer.alloc(2);
				const result = bitArrayToArray(buf);

				expect(result).to.be.an("array").that.is.empty;
			});

			it("should return the correct array of numbers", function () {
				const buf = Buffer.from([0x55, 0x55]);
				const result = bitArrayToArray(buf);

				expect(result).to.be.an("array").that.eqls([0, 2, 4, 6, 8, 10, 12, 14]);
			});
		});

		describe("arrayToBitArray", function () {
			it("should return an zero filled buffer on an empty array", function () {
				const nums: number[] = [];
				const result = arrayToBitArray(nums, 0);

				expect(result).to.be.an.instanceof(Buffer);
				expect(result).to.be.equalBytes(Buffer.alloc(0));
			});

			it("should return an the correctly filled buffer", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14];
				const result = arrayToBitArray(nums, 2);

				expect(result).to.be.an.instanceof(Buffer);
				expect(result).to.be.equalBytes([0x55, 0x55]);
			});

			it("should return the same buffer zeroed", function () {
				const nums: number[] = [];
				const writeToBuffer = Buffer.from([1, 2]);
				const result = arrayToBitArray(nums, 0, writeToBuffer);

				expect(result).to.be.an.instanceof(Buffer).that.equals(writeToBuffer);
				expect(result).to.be.equalBytes([0, 0]);
			});

			it("should return the same buffer that is filled correctly", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14];
				const writeToBuffer = Buffer.from([1, 2, 3]);
				const result = arrayToBitArray(nums, 2, writeToBuffer);

				expect(result).to.be.an.instanceof(Buffer).that.equals(writeToBuffer);
				expect(result).to.be.equalBytes([0x55, 0x55, 0]);
			});

			it("should throw an exception if a negative number is provided", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14, -1];
				const writeToBuffer = Buffer.from([1, 2, 3]);

				expect(() => arrayToBitArray(nums, 2, writeToBuffer)).to.throw();
			});

			it("should throw an exception if the number is out of range of the buffer length", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14, 24];
				const writeToBuffer = Buffer.from([1, 2, 3]);

				expect(() => arrayToBitArray(nums, 2, writeToBuffer)).to.throw();
			});
		});
	});
});
