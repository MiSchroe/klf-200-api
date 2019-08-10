'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_STOP_SCENE_CFM, ActivateSceneStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_STOP_SCENE_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x00, 0x47, 0x11]);
                expect(() => new GW_STOP_SCENE_CFM(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x00, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(result.SessionID).to.equal(0x4711);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x00, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(result.Status).to.equal(ActivateSceneStatus.OK);
            });
        });

        describe("getError", function() {
            it("should throw 'No error.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x00, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(() => result.getError()).to.throw();
            });
            
            it("should return 'Invalid parameter.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x01, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(result.getError()).to.equal("Invalid parameter.");
            });
            
            it("should return 'Request failed.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0x02, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(result.getError()).to.equal("Request failed.");
            });
            
            it("should return 'Unknown error.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x16, 0xff, 0x47, 0x11]);
                const result = new GW_STOP_SCENE_CFM(data);
                expect(result.getError()).to.equal("Unknown error 255.");
            });
        });
    });
});