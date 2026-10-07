"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_GROUP_INFORMATION_NTF, GroupType, NodeVariation, Velocity } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_GROUP_INFORMATION_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				102, 0x02, 0x30,
                // Group ID
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
                // Node Variation
                2,  // KIP
                // Group Type
                0,  // User Group
                // # of objects
                2,  // Two objects in group
                // Actuator bit array
                3, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                // Revision
                0x47, 0x11
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_GROUP_INFORMATION_NTF(data));
			});

			it("should return the group ID", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.GroupID, 1);
			});

			it("should return the order", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.Order, 2);
			});

			it("should return the placement", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.Placement, 3);
			});

			it("should return the name", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.Name, "Dummy");
			});

			it("should return the velocity", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.Velocity, Velocity.Default);
			});

			it("should return the node variation", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.NodeVariation, NodeVariation.Kip);
			});

			it("should return the group type", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.GroupType, GroupType.UserGroup);
			});

			it("should return the nodes", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.ok(result.Nodes instanceof Array);
				assert.deepStrictEqual([...result.Nodes].sort(), [...[0, 1]].sort());
			});

			it("should return the empty nodes list if not User Group", function () {
				const data2 = Buffer.from(data);
				// Change group type
				data2.writeUInt8(GroupType.House, 73);
				const result = new GW_GET_GROUP_INFORMATION_NTF(data2);
				assert.ok(result.Nodes instanceof Array);
				assert.deepStrictEqual([...result.Nodes].sort(), [...[]].sort());
			});

			it("should return the revision", function () {
				const result = new GW_GET_GROUP_INFORMATION_NTF(data);
				assert.strictEqual(result.Revision, 0x4711);
			});
		});
	});
});
