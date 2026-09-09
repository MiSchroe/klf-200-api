"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arrayToBitArray, bitArrayToArray } from "../../src/utils/BitArray";

describe("utils", function () {
	describe("BitArray", function () {
		describe("bitArrayToArray", function () {
			it("should return an empty number array on a zero length buffer", function () {
				const buf = Buffer.alloc(0);
				const result = bitArrayToArray(buf);

				assert.ok(Array.isArray(result));
				assert.strictEqual(result.length, 0);
			});

			it("should return an empty number array on a zero filled buffer", function () {
				const buf = Buffer.alloc(2);
				const result = bitArrayToArray(buf);

				assert.ok(Array.isArray(result));
				assert.strictEqual(result.length, 0);
			});

			it("should return the correct array of numbers", function () {
				const buf = Buffer.from([0x55, 0x55]);
				const result = bitArrayToArray(buf);

				assert.deepStrictEqual(result, [0, 2, 4, 6, 8, 10, 12, 14]);
			});
		});

		describe("arrayToBitArray", function () {
			it("should return an zero filled buffer on an empty array", function () {
				const nums: number[] = [];
				const result = arrayToBitArray(nums, 0);

				assert.ok(result instanceof Buffer);
				assert.deepStrictEqual(result, Buffer.alloc(0));
			});

			it("should return an the correctly filled buffer", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14];
				const result = arrayToBitArray(nums, 2);

				assert.ok(result instanceof Buffer);
				assert.deepStrictEqual(result, Buffer.from([0x55, 0x55]));
			});

			it("should return the same buffer zeroed", function () {
				const nums: number[] = [];
				const writeToBuffer = Buffer.from([1, 2]);
				const result = arrayToBitArray(nums, 0, writeToBuffer);

				assert.ok(result instanceof Buffer);
				assert.strictEqual(result, writeToBuffer);
				assert.deepStrictEqual(result, Buffer.from([0, 0]));
			});

			it("should return the same buffer that is filled correctly", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14];
				const writeToBuffer = Buffer.from([1, 2, 3]);
				const result = arrayToBitArray(nums, 2, writeToBuffer);

				assert.ok(result instanceof Buffer);
				assert.strictEqual(result, writeToBuffer);
				assert.deepStrictEqual(result, Buffer.from([0x55, 0x55, 0]));
			});

			it("should throw an exception if a negative number is provided", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14, -1];
				const writeToBuffer = Buffer.from([1, 2, 3]);

				assert.throws(() => arrayToBitArray(nums, 2, writeToBuffer));
			});

			it("should throw an exception if the number is out of range of the buffer length", function () {
				const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14, 24];
				const writeToBuffer = Buffer.from([1, 2, 3]);

				assert.throws(() => arrayToBitArray(nums, 2, writeToBuffer));
			});
		});
	});
});
