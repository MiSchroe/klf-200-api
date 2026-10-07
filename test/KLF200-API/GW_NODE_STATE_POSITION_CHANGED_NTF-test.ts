"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_NODE_STATE_POSITION_CHANGED_NTF, NodeOperatingState } from "../../src";

describe("KLF200-API", function () {
	describe("GW_NODE_STATE_POSITION_CHANGED_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				23, 0x02, 0x11, 
                // Node ID
                1,
                // State
                4,  // Executing
                // Current Position
                0xc0, 0x00,
                // Target
                0xc8, 0x00,
                // FP1 Current Position
                0xf7, 0xff,
                // FP2 Current Position
                0xf7, 0xff,
                // FP3 Current Position
                0xf7, 0xff,
                // FP4 Current Position
                0xf7, 0xff,
                // Remaining Time
                0, 5,
                // Time stamp
                0x00, 0xf9, 0x39, 0x90
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_NODE_STATE_POSITION_CHANGED_NTF(data));
			});

			it("should return the node ID", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.NodeID, 1);
			});

			it("should return the state", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.OperatingState, NodeOperatingState.Executing);
			});

			it("should return the current position", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.CurrentPosition, 0xc000);
			});

			it("should return the FP1 current position", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.FunctionalPosition1CurrentPosition, 0xf7ff);
			});

			it("should return the FP2 current position", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.FunctionalPosition2CurrentPosition, 0xf7ff);
			});

			it("should return the FP3 current position", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.FunctionalPosition3CurrentPosition, 0xf7ff);
			});

			it("should return the FP4 current position", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.FunctionalPosition4CurrentPosition, 0xf7ff);
			});

			it("should return the remaining time", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.strictEqual(result.RemainingTime, 5);
			});

			it("should return the time stamp", function () {
				const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
				assert.deepStrictEqual(result.TimeStamp, new Date("1970-07-09T01:00:00.000Z"));
			});
		});
	});
});
