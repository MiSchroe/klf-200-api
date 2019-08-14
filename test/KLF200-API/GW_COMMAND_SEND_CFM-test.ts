"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_COMMAND_SEND_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_COMMAND_SEND_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
                expect(() => new GW_COMMAND_SEND_CFM(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
                const result = new GW_COMMAND_SEND_CFM(data);
                expect(result.SessionID).to.equal(0x4711);
            });
        });

        describe("getError", function() {
            it("should return 'No error.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
                const result = new GW_COMMAND_SEND_CFM(data);
                expect(result.getError()).to.equal("No error.");
            });
            
            it("should return 'Command rejected.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
                const result = new GW_COMMAND_SEND_CFM(data);
                expect(result.getError()).to.equal("Command rejected.");
            });
            
            it("should return 'Unknown error.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0xff]);
                const result = new GW_COMMAND_SEND_CFM(data);
                expect(result.getError()).to.equal("Unknown error 255.");
            });
        });
    });
});