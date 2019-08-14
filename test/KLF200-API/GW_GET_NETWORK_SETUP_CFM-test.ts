"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GET_NETWORK_SETUP_CFM } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_NETWORK_SETUP_CFM", function() {
        describe("Constructor", function() {
            const data = Buffer.from([16, 0x00, 0xE1,
                // IP address
                1, 2, 3, 4,
                // Mask
                5, 6, 7, 8,
                // Gateway
                9, 10, 11, 12,
                // DHCP
                1
            ]);
            it("should create without error", function() {
                expect(() => new GW_GET_NETWORK_SETUP_CFM(data)).not.to.throw();
            });

            it("should return the IP address", function() {
                const result = new GW_GET_NETWORK_SETUP_CFM(data);
                expect(result.IPAddress).to.equal("1.2.3.4");
            });

            it("should return the mask", function() {
                const result = new GW_GET_NETWORK_SETUP_CFM(data);
                expect(result.Mask).to.equal("5.6.7.8");
            });

            it("should return the gateway", function() {
                const result = new GW_GET_NETWORK_SETUP_CFM(data);
                expect(result.DefaultGateway).to.equal("9.10.11.12");
            });

            it("should return the DHCP flag", function() {
                const result = new GW_GET_NETWORK_SETUP_CFM(data);
                expect(result.DHCP).to.be.true;
            });
        });
    });
});