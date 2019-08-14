/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { GW_SET_NETWORK_SETUP_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_SET_NETWORK_SETUP_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_SET_NETWORK_SETUP_REQ(true)).not.to.throw();
        });

        it("should write the correct default values", function() {
            const result = new GW_SET_NETWORK_SETUP_REQ(true);
            expect(result).to.be.instanceOf(GW_SET_NETWORK_SETUP_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(15)).to.be.equal(1, "DHCP wrong.");
        });

        it("should write the correct IP addresses", function() {
            const result = new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "5.6.7.8", "9.10.11.12");
            expect(result).to.be.instanceOf(GW_SET_NETWORK_SETUP_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(15)).to.be.equal(0, "DHCP wrong.");
            expect(buff.readUInt32BE(3)).to.be.equal(0x01020304, "IPAddress wrong.");
            expect(buff.readUInt32BE(7)).to.be.equal(0x05060708, "Mask wrong.");
            expect(buff.readUInt32BE(11)).to.be.equal(0x090A0B0C, "DefaultGateway wrong.");
        });

        it("should throw an error on invalid IP address", function() {
            expect(() => new GW_SET_NETWORK_SETUP_REQ(false, "NoIP", "5.6.7.8", "9.10.11.12")).to.throw();
        });

        it("should throw an error on invalid mask address", function() {
            expect(() => new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "NoIP", "9.10.11.12")).to.throw();
        });

        it("should throw an error on invalid default gateway address", function() {
            expect(() => new GW_SET_NETWORK_SETUP_REQ(false, "1.2.3.4", "5.6.7.8", "NoIP")).to.throw();
        });
    });
});