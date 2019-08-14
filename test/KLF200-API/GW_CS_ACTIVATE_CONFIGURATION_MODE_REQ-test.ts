/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ([0, 1, 2, 3])).not.to.throw();
        });

        it("should write multiple nodes", function() {
            const result = new GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ([0, 1, 2, 3]);
            expect(result).to.be.instanceOf(GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(0b00001111);
        });
    });
});