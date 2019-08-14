"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_REMOVE_CONTACT_INPUT_LINK_CFM, GW_INVERSE_STATUS } from "../../src";

describe("KLF200-API", function() {
    describe("GW_REMOVE_CONTACT_INPUT_LINK_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
                expect(() => new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data)).not.to.throw();
            });

            it("should return the contact ID", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
                const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
                expect(result.ContactInputID).to.equal(4);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
                const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
                expect(result.Status).to.equal(GW_INVERSE_STATUS.SUCCESS);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x01]);
                const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
                expect(() => result.getError()).to.throw();
            });
            
            it("should return 'Request failed.'", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x00]);
                const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
                expect(result.getError()).to.equal("Request failed.");
            });

            it("should return 'Unknown error 3.'", function() {
                const data = Buffer.from([0x05, 0x04, 0x65, 0x04, 0x03]);
                const result = new GW_REMOVE_CONTACT_INPUT_LINK_CFM(data);
                expect(result.getError()).to.equal("Unknown error 3.");
            });
        });
    });
});