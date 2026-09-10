"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_NODE_INFORMATION_CHANGED_NTF, NodeVariation } from "../../src";

describe("KLF200-API", function () {
	describe("GW_NODE_INFORMATION_CHANGED_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				72, 0x02, 0x0c, 
                // Node ID
                1,
                // Name
                0x44, 0x75, 0x6d, 0x6d, 0x79, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Order
                0x00, 0x02,
                // Placement
                3,
                // Node Variation
                2  // KIP
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_NODE_INFORMATION_CHANGED_NTF(data));
			});

			it("should return the node ID", function () {
				const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.NodeID, 1);
			});

			it("should return the order", function () {
				const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.Order, 2);
			});

			it("should return the placement", function () {
				const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.Placement, 3);
			});

			it("should return the name", function () {
				const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.Name, "Dummy");
			});

			it("should return the node variation", function () {
				const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
				assert.strictEqual(result.NodeVariation, NodeVariation.Kip);
			});
		});
	});
});
