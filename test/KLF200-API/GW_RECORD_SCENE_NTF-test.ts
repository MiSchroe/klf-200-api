"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_RECORD_SCENE_NTF, RecordSceneStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_RECORD_SCENE_NTF", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
                expect(() => new GW_RECORD_SCENE_NTF(data)).not.to.throw();
            });

            it("should return the scene ID", function() {
                const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
                const result = new GW_RECORD_SCENE_NTF(data);
                expect(result.SceneID).to.equal(42);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x05, 0x04, 0x07, 0x00, 42]);
                const result = new GW_RECORD_SCENE_NTF(data);
                expect(result.Status).to.equal(RecordSceneStatus.OK);
            });
        });
    });
});