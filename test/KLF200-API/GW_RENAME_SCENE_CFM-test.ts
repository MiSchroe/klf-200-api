'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_RENAME_SCENE_CFM, RenameSceneStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_RENAME_SCENE_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x00, 42]);
                expect(() => new GW_RENAME_SCENE_CFM(data)).not.to.throw;
            });

            it("should return the scene ID", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x00, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(result.SceneID).to.equal(42);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x00, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(result.Status).to.equal(RenameSceneStatus.OK);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x00, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(() => result.getError()).to.throw;
            });
            
            it("should return 'Invalid scene ID.'", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x01, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(result.getError()).to.equal("Invalid scene ID.");
            });
            
            it("should return 'Name in use.'", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x02, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(result.getError()).to.equal("Name in use.");
            });

            it("should return 'Unknown error 3.'", function() {
                const data = Buffer.from([0x05, 0x04, 0x0B, 0x03, 42]);
                const result = new GW_RENAME_SCENE_CFM(data);
                expect(result.getError()).to.equal("Unknown error 3.");
            });
        });
    });
});