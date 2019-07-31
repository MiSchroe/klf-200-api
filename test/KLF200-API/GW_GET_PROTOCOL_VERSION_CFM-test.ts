'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_PROTOCOL_VERSION_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_PROTOCOL_VERSION_CFM", function() {
        describe("Constructor", function() {
            const data = Buffer.from([0x07, 0x00, 0x0B, 0x12, 0x34, 0x56, 0x78]);
            it("should create without error", function() {
                expect(() => new GW_GET_PROTOCOL_VERSION_CFM(data)).not.to.throw;
            });

            it("should return the line count", function() {
                const result = new GW_GET_PROTOCOL_VERSION_CFM(data);
                expect(result.MajorVersion).to.equal(0x1234);
            });

            it("should return the status", function() {
                const result = new GW_GET_PROTOCOL_VERSION_CFM(data);
                expect(result.MinorVersion).to.equal(0x5678);
            });
        });
    });
});