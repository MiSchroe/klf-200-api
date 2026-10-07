"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNextSessionID } from "../../src/KLF200-API/GW_COMMAND";
import { GW_ERROR_NTF } from "../../src/KLF200-API/GW_ERROR_NTF";
import { GW_FRAME, GW_FRAME_COMMAND_REQ, GW_FRAME_REQ, readZString } from "../../src/KLF200-API/common";

describe("common", function () {
	describe("GW_FRAME", function () {
		class GW_REBOOT_REQ extends GW_FRAME {
			constructor() {
				super();
			}

			public get Offset(): number {
				return this.offset;
			}
		}

		class GW_REBOOT_REQ_ERROR extends GW_REBOOT_REQ {}

		it("subclass should create successfully", function () {
			assert.doesNotThrow(() => new GW_REBOOT_REQ());
		});

		it("should contain the right command", function () {
			const result = new GW_REBOOT_REQ();

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.strictEqual(result.Command, 0x0001);
		});

		it("should have an offset value of 3", function () {
			const result = new GW_REBOOT_REQ();

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.strictEqual(result.Offset, 3);
		});

		it("unknown subclass should have an undefined command.", function () {
			const result = new GW_REBOOT_REQ_ERROR();

			assert.ok(result instanceof GW_REBOOT_REQ_ERROR);
			assert.strictEqual(result.Command, undefined);
		});
	});

	describe("GW_FRAME_REQ", function () {
		class GW_REBOOT_REQ extends GW_FRAME_REQ {
			constructor(bufferSize: number) {
				super(bufferSize);
			}

			public AllocBuffer(BufferSize: number, CopyData = true): void {
				super.AllocBuffer(BufferSize, CopyData);
			}
		}

		it("subclass should create successfully", function () {
			assert.doesNotThrow(() => new GW_REBOOT_REQ(0));
		});

		it("should contain the right data", function () {
			const expectedData = [0x03, 0x00, 0x01];
			const result = new GW_REBOOT_REQ(0);

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from(expectedData));
		});

		it("should contain the right data after realloc with CopyData = undefined", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x01, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2);

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from(expectedData));
		});

		it("should contain the right data after realloc with CopyData = true", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x01, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2, true);

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from(expectedData));
		});

		it("should contain the right data after realloc with CopyData = false", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x00, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2, false);

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from(expectedData));
		});

		it("should contain the right data after realloc with CopyData = undefined and new length 0", function () {
			const expectedData = [0x03, 0x00, 0x01];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(0);

			assert.ok(result instanceof GW_REBOOT_REQ);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from(expectedData));
		});
	});

	describe("GW_FRAME_COMMAND_REQ", function () {
		class GW_COMMAND_SEND_REQ extends GW_FRAME_COMMAND_REQ {
			constructor() {
				super(0); // We don't care about the data in the tests
			}
		}

		it("subclass should create successfully", function () {
			assert.doesNotThrow(() => new GW_COMMAND_SEND_REQ());
		});

		it("should contain a SessionID", function () {
			const result = new GW_COMMAND_SEND_REQ();
			const expectedSessionID = getNextSessionID() - 1;

			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.strictEqual(result.SessionID, expectedSessionID);
		});

		it("should increment the SessionID with each new request", function () {
			const initialInstance = new GW_COMMAND_SEND_REQ();
			const result = new GW_COMMAND_SEND_REQ();
			const expectedSessionID = getNextSessionID() - 1;

			assert.ok(result instanceof GW_COMMAND_SEND_REQ);
			assert.strictEqual(result.SessionID, expectedSessionID);
			assert.ok(result.SessionID > initialInstance.SessionID);
		});
	});

	describe("GW_FRAME_RCV", function () {
		it("subclass should create successfully", function () {
			assert.doesNotThrow(() => new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x00, 0x07])));
		});

		it("Data should contain payload only", function () {
			const result = new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x00, 0x07]));

			assert.ok(result instanceof GW_ERROR_NTF);
			assert.ok("Data" in result);
			assert.deepStrictEqual(result.Data, Buffer.from([0x07]));
		});

		it("subclass should throw on creation on wrong input data", function () {
			assert.throws(() => new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x01, 0x07])));
		});
	});

	describe("readZString", function () {
		it("should return an empty string, if the first byte is 0", function () {
			const inputBuffer = Buffer.alloc(10);
			const result = readZString(inputBuffer);

			assert.strictEqual(result, "");
		});

		it("should return the string until the first 0, even if the buffer is larger", function () {
			const inputBuffer = Buffer.alloc(10);
			inputBuffer.write("42", 0);
			const result = readZString(inputBuffer);

			assert.strictEqual(result, "42");
		});

		it("should return the string if the buffer is filled completely", function () {
			const inputBuffer = Buffer.from("42");
			const result = readZString(inputBuffer);

			assert.strictEqual(result, "42");
		});

		it("should return the sliced string if the buffer is filled longer, but sliced", function () {
			const inputBuffer = Buffer.from("4242");
			const result = readZString(inputBuffer.subarray(0, 2));

			assert.strictEqual(result, "42");
		});
	});
});
