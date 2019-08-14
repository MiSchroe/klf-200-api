"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GROUP_DELETED_NTF } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GROUP_DELETED_NTF", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x04, 0x02, 0x2D, 42]);
                expect(() => new GW_GROUP_DELETED_NTF(data)).not.to.throw();
            });

            it("should return the group ID", function() {
                const data = Buffer.from([0x04, 0x02, 0x2D, 42]);
                const result = new GW_GROUP_DELETED_NTF(data);
                expect(result.GroupID).to.equal(42);
            });
        });
    });
});