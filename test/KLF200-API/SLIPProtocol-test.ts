"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SLIPProtocol } from "../../src/KLF200-API/common";

describe("KLF200-API", function () {
	describe("SLIPProtocol", function () {
		it("should return the encoded buffer.", function () {
			const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
			const expectedBuffer = Buffer.from([192, 0, 4, 0, 0, 1, 5, 192]);

			const result = SLIPProtocol.Encode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the decoded buffer.", function () {
			const inputBuffer = Buffer.from([192, 0, 4, 0, 0, 1, 5, 192]);
			const expectedBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);

			const result = SLIPProtocol.Decode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the encoded buffer for an empty buffer.", function () {
			const inputBuffer = Buffer.alloc(0);
			const expectedBuffer = Buffer.from([192, 192]);

			const result = SLIPProtocol.Encode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return an empty buffer after decode.", function () {
			const inputBuffer = Buffer.from([192, 192]);
			const expectedBuffer = Buffer.alloc(0);

			const result = SLIPProtocol.Decode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the encoded END marker.", function () {
			const inputBuffer = Buffer.from([192]);
			const expectedBuffer = Buffer.from([192, 219, 220, 192]);

			const result = SLIPProtocol.Encode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the encoded ESC marker.", function () {
			const inputBuffer = Buffer.from([219]);
			const expectedBuffer = Buffer.from([192, 219, 221, 192]);

			const result = SLIPProtocol.Encode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the decoded END marker.", function () {
			const inputBuffer = Buffer.from([192, 219, 220, 192]);
			const expectedBuffer = Buffer.from([192]);

			const result = SLIPProtocol.Decode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should return the decoded ESC marker.", function () {
			const inputBuffer = Buffer.from([192, 219, 221, 192]);
			const expectedBuffer = Buffer.from([219]);

			const result = SLIPProtocol.Decode(inputBuffer);
			assert.deepStrictEqual(result, Buffer.from(expectedBuffer));
		});

		it("should throw an exception on missing markers.", function () {
			const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5]);

			assert.throws(() => SLIPProtocol.Decode(inputBuffer));
		});

		it("should throw an exception on missing start marker.", function () {
			const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5, 192]);

			assert.throws(() => SLIPProtocol.Decode(inputBuffer));
		});

		it("should throw an exception on missing end marker.", function () {
			const inputBuffer = Buffer.from([192, 42, 4, 0, 0, 1, 5]);

			assert.throws(() => SLIPProtocol.Decode(inputBuffer));
		});

		it("should throw an exception on wrong ESC sequence.", function () {
			const inputBuffer = Buffer.from([192, 219, 42, 192]);

			assert.throws(() => SLIPProtocol.Decode(inputBuffer));
		});
	});
});
