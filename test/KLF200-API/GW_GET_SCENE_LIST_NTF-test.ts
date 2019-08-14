"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GET_SCENE_LIST_NTF } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_SCENE_LIST_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([135, 0x04, 0x0E,
                // Number of scenes
                2,
                // Scene 1
                //   ID
                0,
                //   Name
                0x44, 0x75, 0x6D, 0x6D, 0x79, 0x20, 0x31, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Scene 2
                //   ID
                1,
                //   Name
                0x44, 0x75, 0x6D, 0x6D, 0x79, 0x20, 0x32, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Remaining scenes
                5
            ]);
            it("should create without error", function() {
                expect(() => new GW_GET_SCENE_LIST_NTF(data)).not.to.throw();
            });

            it("should return the number of scenes", function() {
                const result = new GW_GET_SCENE_LIST_NTF(data);
                expect(result.NumberOfScenes).to.equal(2);
            });

            it("should return the number of remaining scenes", function() {
                const result = new GW_GET_SCENE_LIST_NTF(data);
                expect(result.NumberOfRemainingScenes).to.equal(5);
            });

            it("should return the scenes", function() {
                const result = new GW_GET_SCENE_LIST_NTF(data);
                expect(result.Scenes).to.be.instanceOf(Array).with.deep.members([
                    {
                        SceneID: 0,
                        Name: "Dummy 1"
                    },
                    {
                        SceneID: 1,
                        Name: "Dummy 2"
                    }
                ]);
            });
        });
    });
});