"use strict";

import { GatewayCommand } from "../../src/KLF200-API/common";
import { GW_CS_RECEIVE_KEY_NTF } from "../../src";
import { expect } from "chai";
import 'mocha';

describe("KLF200-API", function() {
    describe("GW_CS_RECEIVE_KEY_NTF", function () {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([56, 0x01, 0x10, 
                    // Status
                    0,
                    // Key changed
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Key not changed
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                expect(() => new GW_CS_RECEIVE_KEY_NTF(data)).not.to.throw();
            });

            it("should return the ChangeKeyStatus", function() {
                const data = Buffer.from([56, 0x01, 0x10, 
                    // Status
                    0,
                    // Key changed
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Key not changed
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                const result = new GW_CS_RECEIVE_KEY_NTF(data);
                expect(result.ChangeKeyStatus).to.equal(0);
            });

            it("should return the changed nodes", function() {
                const data = Buffer.from([56, 0x01, 0x10, 
                    // Status
                    0,
                    // Key changed
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Key not changed
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                const result = new GW_CS_RECEIVE_KEY_NTF(data);
                expect(result.KeyChangedNodes).to.be.an.instanceOf(Array).and.have.members([0, 9]);
            });

            it("should return the unchanged nodes", function() {
                const data = Buffer.from([56, 0x01, 0x10, 
                    // Status
                    0,
                    // Key changed
                    1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Key not changed
                    4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]);
                const result = new GW_CS_RECEIVE_KEY_NTF(data);
                expect(result.KeyNotChangedNodes).to.be.an.instanceOf(Array).and.have.members([2, 11]);
            });
        });
    });
});