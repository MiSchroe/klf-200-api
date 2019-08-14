/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_PASSWORD_CHANGE_REQ, readZString } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_PASSWORD_CHANGE_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_PASSWORD_CHANGE_REQ("OldPass", "NewPass")).not.to.throw();
        });

        it("should write the correct password values", function() {
            const result = new GW_PASSWORD_CHANGE_REQ("OldPass", "NewPass");
            expect(result).to.be.instanceOf(GW_PASSWORD_CHANGE_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(readZString(buff.slice(3, 35))).to.be.equal("OldPass", "Old password wrong.");
            expect(readZString(buff.slice(35, 67))).to.be.equal("NewPass", "New password wrong.");
        });

        it("shouldn't throw an error with passwords at size of 32 chars", function() {
            expect(() => new GW_PASSWORD_CHANGE_REQ("01234567890123456789012345678901", "01234567890123456789012345678901")).not.to.throw();  //DevSkim: ignore DS173237
        });

        it("should throw an error with old passwords at size greater than 32 chars", function() {
            expect(() => new GW_PASSWORD_CHANGE_REQ("012345678901234567890123456789012", "01234567890123456789012345678901")).to.throw();  //DevSkim: ignore DS173237
        });

        it("should throw an error with new passwords at size greater than 32 chars", function() {
            expect(() => new GW_PASSWORD_CHANGE_REQ("01234567890123456789012345678901", "012345678901234567890123456789012")).to.throw();  //DevSkim: ignore DS173237
        });
    });
});