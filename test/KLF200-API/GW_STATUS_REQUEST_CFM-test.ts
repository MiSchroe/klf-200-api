'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_STATUS_REQUEST_CFM, CommandStatus } from "../../src";

describe("KLF200-API", function() {
    describe("GW_STATUS_REQUEST_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
                expect(() => new GW_STATUS_REQUEST_CFM(data)).not.to.throw;
            });

            it("should return the status", function() {
                const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
                const result = new GW_STATUS_REQUEST_CFM(data);
                expect(result.CommandStatus).to.equal(CommandStatus.CommandAccepted);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x01]);
                const result = new GW_STATUS_REQUEST_CFM(data);
                expect(() => result.getError()).to.throw;
            });
            
            it("should return 'Command rejected.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x00]);
                const result = new GW_STATUS_REQUEST_CFM(data);
                expect(result.getError()).to.equal("Command rejected.");
            });
            
            it("should return 'Unknown error 2.'", function() {
                const data = Buffer.from([0x06, 0x03, 0x06, 0x47, 0x11, 0x02]);
                const result = new GW_STATUS_REQUEST_CFM(data);
                expect(result.getError()).to.equal("Unknown error 2.");
            });
        });
    });
});