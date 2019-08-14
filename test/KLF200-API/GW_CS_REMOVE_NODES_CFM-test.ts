"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_CS_REMOVE_NODES_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_CS_REMOVE_NODES_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x04, 0x01, 0x07, 0x01]);
                expect(() => new GW_CS_REMOVE_NODES_CFM(data)).not.to.throw();
            });

            it("should return scene deleted as true", function() {
                const data = Buffer.from([0x04, 0x01, 0x07, 0x01]);
                const result = new GW_CS_REMOVE_NODES_CFM(data);
                expect(result.SceneDeleted).is.true;
            });
        });
    });
});