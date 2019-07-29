'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_INITIALIZE_SCENE_CFM, InitializeSceneConfirmationStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_INITIALIZE_SCENE_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
                expect(() => new GW_INITIALIZE_SCENE_CFM(data)).not.to.throw;
            });

            it("should return the status", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
                const result = new GW_INITIALIZE_SCENE_CFM(data);
                expect(result.Status).to.equal(InitializeSceneConfirmationStatus.OK);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x00]);
                const result = new GW_INITIALIZE_SCENE_CFM(data);
                expect(() => result.getError()).to.throw;
            });
            
            it("should return 'Empty system table.'", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x01]);
                const result = new GW_INITIALIZE_SCENE_CFM(data);
                expect(result.getError()).to.equal("Empty system table.");
            });
            
            it("should return 'Out of storage for scene.'", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x02]);
                const result = new GW_INITIALIZE_SCENE_CFM(data);
                expect(result.getError()).to.equal("Out of storage for scene.");
            });

            it("should return 'Unknown error 3.'", function() {
                const data = Buffer.from([0x04, 0x04, 0x01, 0x03]);
                const result = new GW_INITIALIZE_SCENE_CFM(data);
                expect(result.getError()).to.equal("Unknown error 3.");
            });
        });
    });
});