"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GET_NODE_INFORMATION_CFM, GW_COMMON_STATUS } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_NODE_INFORMATION_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x00, 42]);
                expect(() => new GW_GET_NODE_INFORMATION_CFM(data)).not.to.throw();
            });

            it("should return the scene ID", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x00, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(result.NodeID).to.equal(42);
            });

            it("should return the status", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x00, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(result.Status).to.equal(GW_COMMON_STATUS.SUCCESS);
            });
        });

        describe("getError", function() {
            it("should throw No error", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x00, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(() => result.getError()).to.throw();
            });
            
            it("should return 'Request failed.'", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x01, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(result.getError()).to.equal("Request failed.");
            });
            
            it("should return 'Invalid node ID.'", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x02, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(result.getError()).to.equal("Invalid node ID.");
            });

            it("should return 'Unknown error 3.'", function() {
                const data = Buffer.from([0x05, 0x02, 0x01, 0x03, 42]);
                const result = new GW_GET_NODE_INFORMATION_CFM(data);
                expect(result.getError()).to.equal("Unknown error 3.");
            });
        });
    });
});