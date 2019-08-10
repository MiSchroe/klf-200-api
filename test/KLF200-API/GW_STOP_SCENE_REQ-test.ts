/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_STOP_SCENE_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_STOP_SCENE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_STOP_SCENE_REQ(42)).not.to.throw;
        });

        it("should write the correct default values", function() {
            const result = new GW_STOP_SCENE_REQ(42);
            expect(result).to.be.instanceOf(GW_STOP_SCENE_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(5)).to.be.equal(1, "CommandOriginator wrong.");
            expect(buff.readUInt8(6)).to.be.equal(3, "PriorityLevel wrong.");
            expect(buff.readUInt8(7)).to.be.equal(42, "SceneID wrong.");
        });
    });
});