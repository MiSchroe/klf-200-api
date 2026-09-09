"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_STATUS_REQUEST_REQ, StatusType } from "../../src";
describe("KLF200-API", function () {
	describe("GW_STATUS_REQUEST_REQ", function () {
		it("shouldn't throw an error on create", function () {
			assert.doesNotThrow(() => new GW_STATUS_REQUEST_REQ(42, StatusType.RequestMainInfo));
		});

		it("should write the correct default values", function () {
			const result = new GW_STATUS_REQUEST_REQ(42, StatusType.RequestMainInfo);
			assert.ok(result instanceof GW_STATUS_REQUEST_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 1, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(6), 42, "NodeID wrong.");
			assert.strictEqual(buff.readUInt8(26), StatusType.RequestMainInfo, "StatusType wrong.");
		});

		it("should write the correct NodeIDs", function () {
			const result = new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo);
			assert.ok(result instanceof GW_STATUS_REQUEST_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(5), 2, "Number of nodes wrong.");
			assert.strictEqual(buff.readUInt8(6), 42, "NodeID 42 wrong.");
			assert.strictEqual(buff.readUInt8(7), 43, "NodeID 43 wrong.");
		});

		it("shouldn't throw on 20 nodes", function () {
			assert.doesNotThrow(
				() =>
					new GW_STATUS_REQUEST_REQ(
						[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
						StatusType.RequestMainInfo,
					),
			);
		});

		it("should throw on 21 nodes", function () {
			assert.throws(
				() =>
					new GW_STATUS_REQUEST_REQ(
						[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
						StatusType.RequestMainInfo,
					),
			);
		});

		it("should write the correct functional parameters", function () {
			const result = new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16]);
			assert.ok(result instanceof GW_STATUS_REQUEST_REQ);
			assert.ok("Data" in result);
			const buff = result.Data;
			assert.strictEqual(buff.readUInt8(27), 0b10100000, "FPI1 wrong.");
			assert.strictEqual(buff.readUInt8(28), 0b00100001, "FPI2 wrong.");
		});

		it("should throw on functional parameter less than 1", function () {
			assert.throws(() => new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16, 0]));
		});

		it("should throw on functional parameter greater than 16", function () {
			assert.throws(() => new GW_STATUS_REQUEST_REQ([42, 43], StatusType.RequestMainInfo, [1, 3, 11, 16, 17]));
		});
	});
});
