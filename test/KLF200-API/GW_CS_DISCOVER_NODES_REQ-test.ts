"use strict";

import { GW_CS_CONTROLLER_COPY_REQ, ControllerCopyMode } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_CS_CONTROLLER_COPY_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_CS_CONTROLLER_COPY_REQ(ControllerCopyMode.ReceivingConfigurationMode)).not.to.throw();
        });

        it("should write the controller copy mode at the right position", function() {
            const result = new GW_CS_CONTROLLER_COPY_REQ(ControllerCopyMode.ReceivingConfigurationMode);
            expect(result).to.be.instanceOf(GW_CS_CONTROLLER_COPY_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(1);
        });
    });
});