'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_WINK_SEND_CFM, GW_INVERSE_STATUS } from "../../src";

describe("KLF200-API", function() {
    describe("GW_WINK_SEND_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
                expect(() => new GW_WINK_SEND_CFM(data)).not.to.throw;
            });

            it("should return the session ID", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
                const result = new GW_WINK_SEND_CFM(data);
                expect(result.SessionID).to.equal(0x4711);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
                const result = new GW_WINK_SEND_CFM(data);
                expect(result.Status).to.equal(GW_INVERSE_STATUS.SUCCESS);
            });
        });

        describe("getError", function() {
            it("should throw 'No error.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
                const result = new GW_WINK_SEND_CFM(data);
                expect(() => result.getError()).to.throw;
            });
            
            it("should return 'Request failed.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x00]);
                const result = new GW_WINK_SEND_CFM(data);
                expect(result.getError()).to.equal("Request failed.");
            });
            
            it("should return 'Unknown error.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0xFF]);
                const result = new GW_WINK_SEND_CFM(data);
                expect(result.getError()).to.equal("Unknown error 255.");
            });
        });
    });
});