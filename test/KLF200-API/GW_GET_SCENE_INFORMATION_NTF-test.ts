'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_SCENE_INFORMATION_NTF } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_SCENE_INFORMATION_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([78, 
                // Command
                0x04, 0x11,
                // SceneID
                42,
                // Name
                0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
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
                1, 0, 0xC4, 0x00,
                // Node 2
                2, 1, 0xC7, 0xFF,
                // # remaining nodes
                3
            ]);
            it("should create without error", function() {
                expect(() => new GW_GET_SCENE_INFORMATION_NTF(data)).not.to.throw;
            });

            it("should return the scene ID", function() {
                const result = new GW_GET_SCENE_INFORMATION_NTF(data);
                expect(result.SceneID).to.equal(42);
            });

            it("should return the name", function() {
                const result = new GW_GET_SCENE_INFORMATION_NTF(data);
                expect(result.Name).to.equal("Dummy");
            });

            it("should return the number of nodes", function() {
                const result = new GW_GET_SCENE_INFORMATION_NTF(data);
                expect(result.NumberOfNodes).to.equal(2);
            });

            it("should return the nodes", function() {
                const result = new GW_GET_SCENE_INFORMATION_NTF(data);
                expect(result.Nodes).to.be.instanceOf(Array).and.be.deep.equal([
                    {
                        NodeID: 1,
                        ParameterID: 0,
                        ParameterValue: 0xC400
                    },
                    {
                        NodeID: 2,
                        ParameterID: 1,
                        ParameterValue: 0xC7FF
                    }
                ]);
            });

            it("should return the number of remaining nodes", function() {
                const result = new GW_GET_SCENE_INFORMATION_NTF(data);
                expect(result.NumberOfRemainingNodes).to.equal(3);
            });
        });
    });
});