'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_VERSION_CFM, SoftwareVersion } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_VERSION_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
                expect(() => new GW_GET_VERSION_CFM(data)).not.to.throw();
            });

            it("should return the Software Version", function() {
                const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
                const result = new GW_GET_VERSION_CFM(data);
                expect(result.SoftwareVersion).to.deep.equal({CommandVersion: 2, MainVersion: 3, SubVersion: 4, BranchID: 71, Build: 5, MicroBuild: 6});
            });

            it("should return the Hardware Version", function() {
                const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
                const result = new GW_GET_VERSION_CFM(data);
                expect(result.HardwareVersion).to.equal(1);
            });

            it("should return the Product Group", function() {
                const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
                const result = new GW_GET_VERSION_CFM(data);
                expect(result.ProductGroup).to.equal(14);
            });

            it("should return the Product Type", function() {
                const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
                const result = new GW_GET_VERSION_CFM(data);
                expect(result.ProductType).to.equal(3);
            });
        });
    });

    describe("SoftwareVersion", function() {
        describe("Constructur", function() {
            it("should create without error", function() {
                expect(() => new SoftwareVersion(2, 3, 4, 71, 5, 6)).not.to.throw();
            });
        });

        describe("toString", function() {
            it("should return 2.3.4.71.5.6", function() {
                const result = new SoftwareVersion(2, 3, 4, 71, 5, 6).toString();
                expect(result).to.equal("2.3.4.71.5.6");
            });
        });
    });
});