'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_ACTIVATE_PRODUCTGROUP_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_ACTIVATE_PRODUCTGROUP_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x00]);
                expect(() => new GW_ACTIVATE_PRODUCTGROUP_CFM(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x00]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.SessionID).to.equal(0x4711);
            });
        });

        describe("getError", function() {
            it("should return 'No error.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x00]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("No error.");
            });
            
            it("should return 'Unknown product group.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x01]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Unknown product group.");
            });
            
            it("should return 'Session ID in use.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x02]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Session ID in use.");
            });
            
            it("should return 'Busy.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x03]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Busy.");
            });
            
            it("should return 'Wrong group type.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x04]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Wrong group type.");
            });
            
            it("should return 'Failed.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x05]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Failed.");
            });
            
            it("should return 'Invalid parameter.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0x06]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Invalid parameter.");
            });
            
            it("should return 'Unknown error.'", function() {
                const data = Buffer.from([0x06, 0x04, 0x48, 0x47, 0x11, 0xff]);
                const result = new GW_ACTIVATE_PRODUCTGROUP_CFM(data);
                expect(result.getError()).to.equal("Unknown error 255.");
            });
        });
    });
});