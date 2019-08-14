/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_DELETE_GROUP_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_DELETE_GROUP_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_DELETE_GROUP_REQ(42)).not.to.throw();
        });

        it("should write the group id at the right position", function() {
            const result = new GW_DELETE_GROUP_REQ(42);
            expect(result).to.be.instanceOf(GW_DELETE_GROUP_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(42);
        });
    });
});