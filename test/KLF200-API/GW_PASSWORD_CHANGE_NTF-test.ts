'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_PASSWORD_CHANGE_NTF } from "../../src";

describe("KLF200-API", function() {
    describe("GW_PASSWORD_CHANGE_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([35, 0x30, 0x04,
                // New password
                0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]);
            it("should create without error", function() {
                expect(() => new GW_PASSWORD_CHANGE_NTF(data)).not.to.throw;
            });

            it("should return the number of scenes", function() {
                const result = new GW_PASSWORD_CHANGE_NTF(data);
                expect(result.NewPassword).to.equal("12345678");
            });
        });
    });
});