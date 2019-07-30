'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_INITIALIZE_SCENE_NTF, InitializeSceneNotificationStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_INITIALIZE_SCENE_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([0x04, 0x04, 0x02, 
                // Status
                0x02,
                // Failed Nodes
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00,
                0x01, 0x01, 0x00, 0x00, 0x00
            ]);
            it("should create without error", function() {
                expect(() => new GW_INITIALIZE_SCENE_NTF(data)).not.to.throw;
            });

            it("should return the status", function() {
                const result = new GW_INITIALIZE_SCENE_NTF(data);
                expect(result.Status).to.equal(InitializeSceneNotificationStatus.Error);
            });

            it("should return the failed nodes", function() {
                const result = new GW_INITIALIZE_SCENE_NTF(data);
                expect(result.FailedNodes).to.be.instanceOf(Array).and.have.members([0, 8, 40, 48, 80, 88, 120, 128, 160, 168]);
            });
        });
    });
});