/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_PASSWORD_ENTER_REQ } from "../../src/KLF200-API/GW_PASSWORD_ENTER_REQ";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_PASSWORD_ENTER_REQ", function () {
        it("should return the provided password.", function() {
            const password = "velux123";
            const passwordBuffer = Buffer.from(password, "utf8");
            const expectedBuffer = Buffer.alloc(32);
            passwordBuffer.copy(expectedBuffer);
    
            const result = new GW_PASSWORD_ENTER_REQ(password);
            expect(result).to.be.instanceOf(GW_PASSWORD_ENTER_REQ);
            expect(result.Data.slice(3)).equalBytes(expectedBuffer);
        });

        it("should return the provided password, if the password length equals 32 bytes.", function() {
            const password = "12345678901234567890123456789012"; //DevSkim: ignore DS117838,DS173237 
            const passwordBuffer = Buffer.from(password, "utf8");
            const expectedBuffer = Buffer.alloc(32);
            passwordBuffer.copy(expectedBuffer);
    
            const result = new GW_PASSWORD_ENTER_REQ(password);
            expect(result).to.be.instanceOf(GW_PASSWORD_ENTER_REQ);
            expect(result.Data.slice(3)).equalBytes(expectedBuffer);
        });

        it("should throw an exception if the password is to long.", function() {
            const password = "123456789012345678901234567890123"; //DevSkim: ignore DS117838,DS173237 
    
            expect(() => new GW_PASSWORD_ENTER_REQ(password)).to.throw();
        });

    });
});