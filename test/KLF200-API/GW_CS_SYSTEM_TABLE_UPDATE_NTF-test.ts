'use strict';

import { GatewayCommand } from "../../src/KLF200-API/common";
import { GW_CS_SYSTEM_TABLE_UPDATE_NTF } from "../../src";
import { expect } from "chai";
import 'mocha';

describe("KLF200-API", function() {
    describe("GW_CS_SYSTEM_TABLE_UPDATE_NTF", function () {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([55, 0x01, 0x12, 
                    // Added nodes
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Removed nodes
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                expect(() => new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data)).not.to.throw();
            });

            it("should return the added and removed nodes", function() {
                const data = Buffer.from([55, 0x01, 0x12, 
                    // Added nodes
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Removed nodes
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                const result = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);
                expect(result.AddedNodes).to.be.an.instanceOf(Array).and.have.members([0, 9]);
                expect(result.RemovedNodes).to.be.an.instanceOf(Array).and.have.members([2, 11]);
            });
        });
    });
});