"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	ActuatorAlias,
	ActuatorType,
	GW_GET_NODE_INFORMATION_NTF,
	NodeOperatingState,
	NodeVariation,
	PowerSaveMode,
	Velocity,
} from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_NODE_INFORMATION_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				127, 0x02, 0x10, 
                // Node ID
                1,
                // Order
                0x00, 0x02,
                // Placement
                3,
                // Name
                0x44, 0x75, 0x6d, 0x6d, 0x79, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Velocity
                0,  // DEFAULT
                // Node Type / Sub type
                0x01, 0x01,
                // Product Group
                0,
                // Product Type
                41,
                // Node Variation
                2,  // KIP
                // Power Mode
                0,
                // Build number
                0,
                // Serial number
                1, 2, 3, 4, 5, 6, 7, 8,
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
                0x00, 0xf9, 0x39, 0x90,
                // # of aliases
                1,
                // Aliases array
                0xd8, 0x03, 0xc4, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_NODE_INFORMATION_NTF(data));
			});

			it("should return the node ID", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.NodeID, 1);
			});

			it("should return the order", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.Order, 2);
			});

			it("should return the placement", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.Placement, 3);
			});

			it("should return the name", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.Name, "Dummy");
			});

			it("should return the velocity", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.Velocity, Velocity.Default);
			});

			it("should return the node type", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.ActuatorType, ActuatorType.WindowOpener);
			});

			it("should return the node sub type", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.ActuatorSubType, 1);
			});

			it("should return the product group", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.ProductGroup, 0);
			});

			it("should return the product type", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.ProductType, 41);
			});

			it("should return the node variation", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.NodeVariation, NodeVariation.Kip);
			});

			it("should return the power mode", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.PowerSaveMode, PowerSaveMode.AlwaysAlive);
			});

			it("should return the serial number", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.deepStrictEqual(result.SerialNumber, Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
			});

			it("should return the state", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.OperatingState, NodeOperatingState.Executing);
			});

			it("should return the current position", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.CurrentPosition, 0xc000);
			});

			it("should return the FP1 current position", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.FunctionalPosition1CurrentPosition, 0xf7ff);
			});

			it("should return the FP2 current position", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.FunctionalPosition2CurrentPosition, 0xf7ff);
			});

			it("should return the FP3 current position", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.FunctionalPosition3CurrentPosition, 0xf7ff);
			});

			it("should return the FP4 current position", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.FunctionalPosition4CurrentPosition, 0xf7ff);
			});

			it("should return the remaining time", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.strictEqual(result.RemainingTime, 5);
			});

			it("should return the time stamp", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.deepStrictEqual(result.TimeStamp, new Date("1970-07-09T01:00:00.000Z"));
			});

			it("should return the aliases array", function () {
				const result = new GW_GET_NODE_INFORMATION_NTF(data);
				assert.ok(result.ActuatorAliases instanceof Array);
				assert.strictEqual(result.ActuatorAliases.length, 1);
				assert.deepStrictEqual(result.ActuatorAliases[0], new ActuatorAlias(0xd803, 0xc400));
			});
		});
	});
});
