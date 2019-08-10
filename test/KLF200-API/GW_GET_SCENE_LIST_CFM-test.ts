'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_SCENE_LIST_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_SCENE_LIST_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x04, 0x0D, 42]);
                expect(() => new GW_GET_SCENE_LIST_CFM(data)).not.to.throw();
            });

            it("should return the number of scenes", function() {
                const data = Buffer.from([0x06, 0x04, 0x0D, 42]);
                const result = new GW_GET_SCENE_LIST_CFM(data);
                expect(result.NumberOfScenes).to.equal(42);
            });
        });
    });
});