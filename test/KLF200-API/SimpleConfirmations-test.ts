"use strict";

import { expect, use } from "chai";
import chaiBytes from "chai-bytes";
import 'mocha';
import { GW_SET_UTC_CFM, IGW_FRAME_RCV_CTOR, GW_REBOOT_CFM, GW_SET_FACTORY_DEFAULT_CFM, GW_SET_NETWORK_SETUP_CFM, GW_CS_GET_SYSTEMTABLE_DATA_CFM, GW_CS_DISCOVER_NODES_CFM, GW_CS_VIRGIN_STATE_CFM, GW_CS_CONTROLLER_COPY_CFM, GW_CS_GENERATE_NEW_KEY_CFM, GW_CS_RECEIVE_KEY_CFM, GW_CS_REPAIR_KEY_CFM, GW_HOUSE_STATUS_MONITOR_ENABLE_CFM, GW_HOUSE_STATUS_MONITOR_DISABLE_CFM, GW_CLEAR_ACTIVATION_LOG_CFM } from "../../src";

use(chaiBytes);

type confirmationListEntryType = {
    ConfirmationClass: IGW_FRAME_RCV_CTOR,
    ConfirmationBytes: number[]
}

const simpleConfirmations: confirmationListEntryType[] = [
    { ConfirmationClass: GW_SET_UTC_CFM, ConfirmationBytes: [0x03, 0x20, 0x01] },
    { ConfirmationClass: GW_REBOOT_CFM, ConfirmationBytes: [0x03, 0x00, 0x02] },
    { ConfirmationClass: GW_SET_FACTORY_DEFAULT_CFM, ConfirmationBytes: [0x03, 0x00, 0x04] },
    { ConfirmationClass: GW_SET_NETWORK_SETUP_CFM, ConfirmationBytes: [0x03, 0x00, 0xe3] },
    { ConfirmationClass: GW_CS_GET_SYSTEMTABLE_DATA_CFM, ConfirmationBytes: [0x03, 0x01, 0x01] },
    { ConfirmationClass: GW_CS_DISCOVER_NODES_CFM, ConfirmationBytes: [0x03, 0x01, 0x04] },
    { ConfirmationClass: GW_CS_VIRGIN_STATE_CFM, ConfirmationBytes: [0x03, 0x01, 0x09] },
    { ConfirmationClass: GW_CS_CONTROLLER_COPY_CFM, ConfirmationBytes: [0x03, 0x01, 0x0b] },
    { ConfirmationClass: GW_CS_GENERATE_NEW_KEY_CFM, ConfirmationBytes: [0x03, 0x01, 0x14] },
    { ConfirmationClass: GW_CS_RECEIVE_KEY_CFM, ConfirmationBytes: [0x03, 0x01, 0x0f] },
    { ConfirmationClass: GW_CS_REPAIR_KEY_CFM, ConfirmationBytes: [0x03, 0x01, 0x17] },
    { ConfirmationClass: GW_HOUSE_STATUS_MONITOR_ENABLE_CFM, ConfirmationBytes: [0x03, 0x02, 0x41] },
    { ConfirmationClass: GW_HOUSE_STATUS_MONITOR_DISABLE_CFM, ConfirmationBytes: [0x03, 0x02, 0x43] },
    { ConfirmationClass: GW_CLEAR_ACTIVATION_LOG_CFM, ConfirmationBytes: [0x03, 0x05, 0x03] }
];

describe("KLF200-API", function() {
    describe("Simple Confirmations", function() {
        for (const confirmationTestCase of simpleConfirmations) {
            describe(confirmationTestCase.ConfirmationClass.name, function() {
                it("should create the class without error", function() {
                    expect(() => new confirmationTestCase.ConfirmationClass(Buffer.from(confirmationTestCase.ConfirmationBytes))).not.to.throw();
                });
            });
        }
    });
});