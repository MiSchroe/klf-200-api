"use strict";

import { KLF200Protocol } from "../../src/KLF200-API/common";
import { expect, use } from "chai";
import "mocha";

import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function () {
	describe("KLF200Protocol", function () {
		it("should return the encoded buffer.", function () {
			const inputBuffer = Buffer.from([4, 0, 0, 1]);
			const expectedBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);

			const result = KLF200Protocol.Encode(inputBuffer);
			expect(result).equalBytes(expectedBuffer);
		});

		it("should return the decoded buffer.", function () {
			const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
			const expectedBuffer = Buffer.from([4, 0, 0, 1]);

			const result = KLF200Protocol.Decode(inputBuffer);
			expect(result).equalBytes(expectedBuffer);
		});

		it("should return the encoded buffer for an empty buffer.", function () {
			const inputBuffer = Buffer.alloc(0);
			const expectedBuffer = Buffer.from([0, 0]);

			const result = KLF200Protocol.Encode(inputBuffer);
			expect(result).equalBytes(expectedBuffer);
		});

		it("should return an empty buffer after decode.", function () {
			const inputBuffer = Buffer.from([0, 0]);
			const expectedBuffer = Buffer.alloc(0);

			const result = KLF200Protocol.Decode(inputBuffer);
			expect(result).equalBytes(expectedBuffer);
		});

		it("should throw an exception on wrong ProtocolID.", function () {
			const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5]);

			expect(() => KLF200Protocol.Decode(inputBuffer)).to.throw();
		});

		it("should throw an exception on wrong CRC.", function () {
			const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 42]);

			expect(() => KLF200Protocol.Decode(inputBuffer)).to.throw();
		});
	});
});
