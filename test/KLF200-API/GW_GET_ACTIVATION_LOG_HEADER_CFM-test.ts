'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_ACTIVATION_LOG_HEADER_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_ACTIVATION_LOG_HEADER_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x07, 0x05, 0x01, 0x98, 0x76, 0x12, 0x34]);
                expect(() => new GW_GET_ACTIVATION_LOG_HEADER_CFM(data)).not.to.throw();
            });

            it("should return the correct max line count and current line count values", function() {
                const data = Buffer.from([0x07, 0x05, 0x01, 0x98, 0x76, 0x12, 0x34]);
                const result = new GW_GET_ACTIVATION_LOG_HEADER_CFM(data);
                expect(result.MaxLineCount).to.equal(0x9876);
                expect(result.LineCount).to.equal(0x1234);
            });
        });
    });
});