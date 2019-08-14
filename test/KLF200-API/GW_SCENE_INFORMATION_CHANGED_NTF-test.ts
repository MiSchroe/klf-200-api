"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_SCENE_INFORMATION_CHANGED_NTF, SceneChangeType } from "../../src";

describe("KLF200-API", function() {
    describe("GW_SCENE_INFORMATION_CHANGED_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([5, 0x04, 0x19, 0x01, 42]);
            it("should create without error", function() {
                expect(() => new GW_SCENE_INFORMATION_CHANGED_NTF(data)).not.to.throw();
            });

            it("should return the scenes ID", function() {
                const result = new GW_SCENE_INFORMATION_CHANGED_NTF(data);
                expect(result.SceneID).to.equal(42);
            });

            it("should return the scenes change type", function() {
                const result = new GW_SCENE_INFORMATION_CHANGED_NTF(data);
                expect(result.SceneChangeType).to.equal(SceneChangeType.Modified);
            });
        });
    });
});