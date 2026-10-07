"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommandOriginator, GW_LIMITATION_STATUS_NTF, ParameterActive } from "../../src";

describe("KLF200-API", function () {
	describe("GW_LIMITATION_STATUS_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				13, 0x03, 0x14,
                // Session ID
                0x47, 0x11,
                // Node ID
                1,
                // ParameterID
                2,  // FP2
                // Min value
                0x12, 0x34,
                // Max value
                0x56, 0x78,
                // Limitation originator
                1,      // User
                // Limitation time
                252     // 7590 seconds
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_LIMITATION_STATUS_NTF(data));
			});

			it("should return the session ID", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the node ID", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.NodeID, 1);
			});

			it("should return the parameter ID", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.ParameterID, ParameterActive.FP2);
			});

			it("should return the min value", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.LimitationValueMin, 0x1234);
			});

			it("should return the max value", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.LimitationValueMax, 0x5678);
			});

			it("should return the limitation originator", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.LimitationOriginator, CommandOriginator.User);
			});

			it("should return the limitation time", function () {
				const result = new GW_LIMITATION_STATUS_NTF(data);
				assert.strictEqual(result.LimitationTime, 252);
			});
		});
	});
});
