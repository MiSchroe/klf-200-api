"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GatewayCommand } from "../../src/KLF200-API/common";
import { GW_ERROR, GW_ERROR_NTF } from "../../src/KLF200-API/GW_ERROR_NTF";

describe("KLF200-API", function () {
	describe("GW_ERROR_NTF", function () {
		it("should return a valid error number.", function () {
			const error = 7; // Busy
			const buff = Buffer.alloc(4);
			buff.writeUInt8(4, 0);
			buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
			buff.writeUInt8(error, 3);

			const result = new GW_ERROR_NTF(buff);
			assert.ok(result instanceof GW_ERROR_NTF);
			assert.strictEqual(result.ErrorNumber, error);
		});

		it("should return a valid zero error number.", function () {
			const error = 0; // NotFurtherDefined
			const buff = Buffer.alloc(4);
			buff.writeUInt8(4, 0);
			buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
			buff.writeUInt8(error, 3);

			const result = new GW_ERROR_NTF(buff);
			assert.ok(result instanceof GW_ERROR_NTF);
			assert.strictEqual(result.ErrorNumber, error);
		});

		it("should return the unknown error number.", function () {
			const error = 255; // UnknonwErrorCode
			const buff = Buffer.alloc(4);
			buff.writeUInt8(4, 0);
			buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
			buff.writeUInt8(error, 3);

			const result = new GW_ERROR_NTF(buff);
			assert.ok(result instanceof GW_ERROR_NTF);
			assert.strictEqual(result.ErrorNumber, error);
		});

		it("should return the unknown error number, if the provided error number is not known.", function () {
			const error = 128; // UnknonwErrorCode
			const buff = Buffer.alloc(4);
			buff.writeUInt8(4, 0);
			buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
			buff.writeUInt8(error, 3);

			const result = new GW_ERROR_NTF(buff);
			assert.ok(result instanceof GW_ERROR_NTF);
			assert.strictEqual(result.ErrorNumber, GW_ERROR.UnknonwErrorCode);
		});

		it("should throw an exception if the command isn't matching", function () {
			const error = 128; // UnknonwErrorCode
			const buff = Buffer.alloc(4);
			buff.writeUInt8(4, 0);
			buff.writeUInt16BE(GatewayCommand.GW_ACTIVATE_SCENE_CFM, 1); // Just take some other command
			buff.writeUInt8(error, 3);

			assert.throws(() => new GW_ERROR_NTF(buff));
		});

		describe("getError()", function () {
			const errorCodesAndMessages = [
				{ ErrorCode: 0, ErrorMessage: "Not further defined error." },
				{ ErrorCode: 1, ErrorMessage: "Unknown command." },
				{ ErrorCode: 2, ErrorMessage: "Invalid frame structure." },
				{ ErrorCode: 7, ErrorMessage: "Busy." },
				{ ErrorCode: 8, ErrorMessage: "Invalid system table index." },
				{ ErrorCode: 12, ErrorMessage: "Not authenticated." },
				{ ErrorCode: 255, ErrorMessage: "Unknown error (255)." },
			];
			errorCodesAndMessages.forEach((errorCodeAndMessage) => {
				it(`should return the correct error message for error code ${errorCodeAndMessage.ErrorCode}`, function () {
					const error = errorCodeAndMessage.ErrorCode; // UnknonwErrorCode
					const buff = Buffer.alloc(4);
					buff.writeUInt8(4, 0);
					buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
					buff.writeUInt8(error, 3);

					const result = new GW_ERROR_NTF(buff);
					assert.ok(result instanceof GW_ERROR_NTF);
					assert.strictEqual(result.ErrorNumber, error);
					assert.strictEqual(result.getError(), errorCodeAndMessage.ErrorMessage);
				});
			});
		});
	});
});
