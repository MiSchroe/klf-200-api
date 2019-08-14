/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_ACTIVATE_SCENE_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_ACTIVATE_SCENE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_ACTIVATE_SCENE_REQ(1)).not.to.throw();
        });

        it("should create the right object with default values", function() {
            const result = new GW_ACTIVATE_SCENE_REQ(1);
            expect(result).to.be.instanceOf(GW_ACTIVATE_SCENE_REQ).that.has.property("SessionID");
            expect(result).to.be.instanceOf(GW_ACTIVATE_SCENE_REQ).that.has.property("SceneID", 1);
            expect(result).to.be.instanceOf(GW_ACTIVATE_SCENE_REQ).that.has.property("PriorityLevel", 3);
            expect(result).to.be.instanceOf(GW_ACTIVATE_SCENE_REQ).that.has.property("CommandOriginator", 1);
            expect(result).to.be.instanceOf(GW_ACTIVATE_SCENE_REQ).that.has.property("Velocity", 0);
        });
    });
});