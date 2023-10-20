"use strict";

import { expect, use } from "chai";
import chaibytes from "chai-bytes";
import { getNextSessionID } from "../../src/KLF200-API/GW_COMMAND";
import { GW_ERROR_NTF } from "../../src/KLF200-API/GW_ERROR_NTF";
import { GW_FRAME, GW_FRAME_COMMAND_REQ, GW_FRAME_REQ, readZString } from "../../src/KLF200-API/common";

use(chaibytes);

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
			expect(() => new GW_REBOOT_REQ()).not.to.throw();
		});

		it("should contain the right command", function () {
			const result = new GW_REBOOT_REQ();

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Command", 0x0001);
		});

		it("should have an offset value of 3", function () {
			const result = new GW_REBOOT_REQ();

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Offset", 3);
		});

		it("unknown subclass should have an undefined command.", function () {
			const result = new GW_REBOOT_REQ_ERROR();

			expect(result).to.be.instanceOf(GW_REBOOT_REQ_ERROR).that.has.property("Command", undefined);
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
			expect(() => new GW_REBOOT_REQ(0)).not.to.throw();
		});

		it("should contain the right data", function () {
			const expectedData = [0x03, 0x00, 0x01];
			const result = new GW_REBOOT_REQ(0);

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Data");
			expect(result.Data).to.equalBytes(expectedData);
		});

		it("should contain the right data after realloc with CopyData = undefined", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x01, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2);

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Data");
			expect(result.Data).to.equalBytes(expectedData);
		});

		it("should contain the right data after realloc with CopyData = true", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x01, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2, true);

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Data");
			expect(result.Data).to.equalBytes(expectedData);
		});

		it("should contain the right data after realloc with CopyData = false", function () {
			const expectedData = [0x05, 0x00, 0x01, 0x00, 0x00];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(2, false);

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Data");
			expect(result.Data).to.equalBytes(expectedData);
		});

		it("should contain the right data after realloc with CopyData = undefined and new length 0", function () {
			const expectedData = [0x03, 0x00, 0x01];
			const result = new GW_REBOOT_REQ(1);
			result.Data.writeUInt8(1, 3);
			result.AllocBuffer(0);

			expect(result).to.be.instanceOf(GW_REBOOT_REQ).that.has.property("Data");
			expect(result.Data).to.equalBytes(expectedData);
		});
	});

	describe("GW_FRAME_COMMAND_REQ", function () {
		class GW_COMMAND_SEND_REQ extends GW_FRAME_COMMAND_REQ {
			constructor() {
				super(0); // We don't care about the data in the tests
			}
		}

		it("subclass should create successfully", function () {
			expect(() => new GW_COMMAND_SEND_REQ()).not.to.throw();
		});

		it("should contain a SessionID", function () {
			const result = new GW_COMMAND_SEND_REQ();
			const expectedSessionID = getNextSessionID() - 1;

			expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("SessionID", expectedSessionID);
		});

		it("should increment the SessionID with each new request", function () {
			const initialInstance = new GW_COMMAND_SEND_REQ();
			const result = new GW_COMMAND_SEND_REQ();
			const expectedSessionID = getNextSessionID() - 1;

			expect(result).to.be.instanceOf(GW_COMMAND_SEND_REQ).that.has.property("SessionID", expectedSessionID);
			expect(result.SessionID).to.be.greaterThan(initialInstance.SessionID);
		});
	});

	describe("GW_FRAME_RCV", function () {
		it("subclass should create successfully", function () {
			expect(() => new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x00, 0x07]))).not.to.throw();
		});

		it("Data should contain payload only", function () {
			const result = new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x00, 0x07]));

			expect(result).to.be.instanceOf(GW_ERROR_NTF).that.has.property("Data");
			expect(result.Data).to.equalBytes([0x07]);
		});

		it("subclass should throw on creation on wrong input data", function () {
			expect(() => new GW_ERROR_NTF(Buffer.from([0x04, 0x00, 0x01, 0x07]))).to.throw();
		});
	});

	describe("readZString", function () {
		it("should return an empty string, if the first byte is 0", function () {
			const inputBuffer = Buffer.alloc(10);
			const result = readZString(inputBuffer);

			expect(result).to.equal("");
		});

		it("should return the string until the first 0, even if the buffer is larger", function () {
			const inputBuffer = Buffer.alloc(10);
			inputBuffer.write("42", 0);
			const result = readZString(inputBuffer);

			expect(result).to.equal("42");
		});

		it("should return the string if the buffer is filled completely", function () {
			const inputBuffer = Buffer.from("42");
			const result = readZString(inputBuffer);

			expect(result).to.equal("42");
		});

		it("should return the sliced string if the buffer is filled longer, but sliced", function () {
			const inputBuffer = Buffer.from("4242");
			const result = readZString(inputBuffer.slice(0, 2));

			expect(result).to.equal("42");
		});
	});
});
