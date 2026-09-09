"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_ACTIVATION_LOG_LINE_CFM, ParameterActive, RunStatus, StatusOwner, StatusReply } from "../../src";
describe("KLF200-API", function () {
	describe("GW_GET_ACTIVATION_LOG_LINE_CFM", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				// prettier-ignore
				const data = Buffer.from([
                    20, 0x05, 0x05, 
                    // Timestamp for 2018-12-31
                    0x5c, 0x29, 0x5c, 0x00,
                    // Session ID
                    0, 42,
                    // Status
                    0x02,   // rain sensor
                    // Index
                    17,
                    // Node parameter
                    0,
                    // Parameter value
                    0x00, 0x00,
                    // Run status
                    0x01,   // failed
                    // Status reply
                    0x03,   // manually operated
                    // Information code
                    0x12, 0x34, 0x56, 0x78
                ]);

				assert.doesNotThrow(() => new GW_GET_ACTIVATION_LOG_LINE_CFM(data));
			});

			it("should return the correct property values", function () {
				// prettier-ignore
				const data = Buffer.from([
                    20, 0x05, 0x05, 
                    // Timestamp for 2018-12-31
                    0x5c, 0x29, 0x5c, 0x00,
                    // Session ID
                    0, 42,
                    // Status
                    0x02,   // rain sensor
                    // Index
                    17,
                    // Node parameter
                    0,
                    // Parameter value
                    0x12, 0x34,
                    // Run status
                    0x01,   // failed
                    // Status reply
                    0x03,   // manually operated
                    // Information code
                    0x12, 0x34, 0x56, 0x78
                ]);

				const result = new GW_GET_ACTIVATION_LOG_LINE_CFM(data);
				assert.deepStrictEqual(result.TimeStamp, new Date(1546214400000));
				assert.strictEqual(result.SessionID, 42);
				assert.strictEqual(result.StatusOwner, StatusOwner.Rain);
				assert.strictEqual(result.NodeID, 17);
				assert.strictEqual(result.NodeParameter, ParameterActive.MP);
				assert.strictEqual(result.ParameterValue, 0x1234);
				assert.strictEqual(result.RunStatus, RunStatus.ExecutionFailed);
				assert.strictEqual(result.StatusReply, StatusReply.ManuallyOperated);
				assert.strictEqual(result.InformationCode, 0x12345678);
			});
		});
	});
});
