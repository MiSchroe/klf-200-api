"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_MODE_SEND_CFM, ModeStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_MODE_SEND_CFM", function() {
        describe("Constructor", function() {
            const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x00]);
            it("should create without error", function() {
                expect(() => new GW_MODE_SEND_CFM(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.SessionID).to.equal(0x4711);
            });

            it("should return the status", function() {
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.ModeStatus).to.equal(ModeStatus.OK);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x00]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(() => result.getError()).to.throw();
            });
            
            it("should return 'Command rejected.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x01]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Command rejected.");
            });
            
            it("should return 'Unknown client ID.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x02]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Unknown client ID.");
            });

            it("should return 'Session ID in use.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x03]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Session ID in use.");
            });

            it("should return 'Busy.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x04]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Busy.");
            });

            it("should return 'Invalid parameter value.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0x05]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Invalid parameter value.");
            });

            it("should return 'Failed.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0xFF]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Failed.");
            });

            it("should return 'Unknown error 254.'", function() {
                const data = Buffer.from([6, 0x03, 0x21, 0x47, 0x11, 0xFE]);
                const result = new GW_MODE_SEND_CFM(data);
                expect(result.getError()).to.equal("Unknown error 254.");
            });
        });
    });
});