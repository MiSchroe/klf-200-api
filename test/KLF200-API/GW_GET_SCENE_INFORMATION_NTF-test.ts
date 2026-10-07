"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_GET_SCENE_INFORMATION_NTF } from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_SCENE_INFORMATION_NTF", function () {
		describe("Constructor", function () {
			// prettier-ignore
			const data = Buffer.from([
				78,
                // Command
                0x04, 0x11,
                // SceneID
                42,
                // Name
                0x44, 0x75, 0x6d, 0x6d, 0x79, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // # nodes
                2,
                // Node 1
                1, 0, 0xc4, 0x00,
                // Node 2
                2, 1, 0xc7, 0xff,
                // # remaining nodes
                3
            ]);

			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_GET_SCENE_INFORMATION_NTF(data));
			});

			it("should return the scene ID", function () {
				const result = new GW_GET_SCENE_INFORMATION_NTF(data);
				assert.strictEqual(result.SceneID, 42);
			});

			it("should return the name", function () {
				const result = new GW_GET_SCENE_INFORMATION_NTF(data);
				assert.strictEqual(result.Name, "Dummy");
			});

			it("should return the number of nodes", function () {
				const result = new GW_GET_SCENE_INFORMATION_NTF(data);
				assert.strictEqual(result.NumberOfNodes, 2);
			});

			it("should return the nodes", function () {
				const result = new GW_GET_SCENE_INFORMATION_NTF(data);
				assert.ok(result.Nodes instanceof Array);
				assert.deepStrictEqual(result.Nodes, [
					{
						NodeID: 1,
						ParameterID: 0,
						ParameterValue: 0xc400,
					},
					{
						NodeID: 2,
						ParameterID: 1,
						ParameterValue: 0xc7ff,
					},
				]);
			});

			it("should return the number of remaining nodes", function () {
				const result = new GW_GET_SCENE_INFORMATION_NTF(data);
				assert.strictEqual(result.NumberOfRemainingNodes, 3);
			});
		});
	});
});
