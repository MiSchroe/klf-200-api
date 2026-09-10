"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF,
	ParameterActive,
	RunStatus,
	StatusOwner,
	StatusReply,
} from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF", function () {
		describe("Constructor", function () {
			const testDate = new Date(2019, 6, 9, 12, 34, 56);
			// prettier-ignore
			const data = Buffer.from([
				20, 0x05, 0x08,
                // Timestamp
                ((testDate.valueOf() / 1000) >>> 24) & 0xff,
                ((testDate.valueOf() / 1000) >>> 16) & 0xff,
                ((testDate.valueOf() / 1000) >>>  8) & 0xff,
                ((testDate.valueOf() / 1000) >>>  0) & 0xff,
                // Session ID
                0x47, 0x11,
                // Status ID
                0x02,   // Rain
                // Node ID
                42,
                // Node parameter
                0x01,   // FP1
                // Parameter value
                0xc4, 0xef,
                // Run status
                0x02,   // Execution active
                // Status reply
                0x01,   // Ok
                // Information code
                0x87, 0x65, 0x43, 0x21
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data));
			});

			it("should return the timestamp", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.deepStrictEqual(result.TimeStamp, testDate);
			});

			it("should return the session ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the status ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.StatusOwner, StatusOwner.Rain);
			});

			it("should return the node ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.NodeID, 42);
			});

			it("should return the node parameter FP1", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.NodeParameter, ParameterActive.FP1);
			});

			it("should return the parameter value", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.ParameterValue, 0xc4ef);
			});

			it("should return the run status", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.RunStatus, RunStatus.ExecutionActive);
			});

			it("should return the status reply", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.StatusReply, StatusReply.Ok);
			});

			it("should return the information code", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				assert.strictEqual(result.InformationCode, 0x87654321);
			});
		});
	});
});
