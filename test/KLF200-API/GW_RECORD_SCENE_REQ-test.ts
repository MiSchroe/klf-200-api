/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_RECORD_SCENE_REQ, readZString } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_RECORD_SCENE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_RECORD_SCENE_REQ("Dummy")).not.to.throw();
        });

        it("should write the correct scene name", function() {
            const result = new GW_RECORD_SCENE_REQ("Dummy");
            expect(result).to.be.instanceOf(GW_RECORD_SCENE_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(readZString(buff.slice(3, 67))).to.be.equal("Dummy");
        });

        it("shouldn't throw an error with scene name at size of 64 chars", function() {
            expect(() => new GW_RECORD_SCENE_REQ("0123456789012345678901234567890123456789012345678901234567890123")).not.to.throw();  //DevSkim: ignore DS173237
        });

        it("should throw an error with old passwords at size greater than 64 chars", function() {
            expect(() => new GW_RECORD_SCENE_REQ("01234567890123456789012345678901234567890123456789012345678901234")).to.throw();  //DevSkim: ignore DS173237
        });
    });
});