/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_CS_REMOVE_NODES_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_CS_REMOVE_NODES_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_CS_REMOVE_NODES_REQ([42])).not.to.throw();
        });

        it("should create the right object with the bit for node 42 set", function() {
            const result = new GW_CS_REMOVE_NODES_REQ([42]);
            expect(result).to.be.instanceOf(GW_CS_REMOVE_NODES_REQ).that.has.property("Nodes");
            expect(result.Data.readUInt8(8)).to.equal(0b00000100, `Data: ${result.Data.toString("hex")}`);
        });
    });
});