import { expect, use } from "chai";
import { FrameRcvFactory } from "../../src/KLF200-API/FrameRcvFactory";
import { GW_REBOOT_CFM } from "../../src/KLF200-API/GW_REBOOT_CFM";
import chaiAsPromised from "chai-as-promised";

'use strict';

use(chaiAsPromised);

describe("FrameRcvFactory", function() {
    describe("CreateRcvFrame", function() {
        it("should create a GW_REBOOT_CFM object from the provided buffer", function(done) {
            const buf = Buffer.from([0x03, 0x00, 0x02]);

            expect(FrameRcvFactory.CreateRcvFrame(buf)).to.be.eventually.instanceOf(GW_REBOOT_CFM).notify(done);
        });

        it("should throw an error on an unknown command", function(done) {
            const buf = Buffer.from([0x03, 0xff, 0xff]);

            expect(FrameRcvFactory.CreateRcvFrame(buf)).to.be.rejected.and.notify(done);
        });
    });
});