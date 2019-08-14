/// <reference path="../../types/chai-bytes/index.d.ts" />

"use strict";

import { expect, use } from "chai";
import chaiBytes from "chai-bytes";
import 'mocha';
import { GW_SET_UTC_CFM, IGW_FRAME_RCV_CTOR, GW_REBOOT_CFM, GW_SET_FACTORY_DEFAULT_CFM, GW_SET_NETWORK_SETUP_CFM, GW_CS_GET_SYSTEMTABLE_DATA_CFM, GW_CS_DISCOVER_NODES_CFM, GW_CS_VIRGIN_STATE_CFM, GW_CS_CONTROLLER_COPY_CFM, GW_CS_GENERATE_NEW_KEY_CFM, GW_CS_RECEIVE_KEY_CFM, GW_CS_REPAIR_KEY_CFM, GW_HOUSE_STATUS_MONITOR_ENABLE_CFM, GW_HOUSE_STATUS_MONITOR_DISABLE_CFM, GW_CLEAR_ACTIVATION_LOG_CFM, GW_ACTIVATION_LOG_UPDATED_NTF, GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF } from "../../src";

use(chaiBytes);

type notificationListEntryType = {
    NotificationClass: IGW_FRAME_RCV_CTOR,
    NotificationBytes: number[]
}

const simpleNotifications: notificationListEntryType[] = [
    { NotificationClass: GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF, NotificationBytes: [0x03, 0x02, 0x05] },
    { NotificationClass: GW_ACTIVATION_LOG_UPDATED_NTF, NotificationBytes: [0x03, 0x05, 0x06] }
];

describe("KLF200-API", function() {
    describe("Simple Notifications", function() {
        for (const notificationTestCase of simpleNotifications) {
            describe(notificationTestCase.NotificationClass.name, function() {
                it("should create the class without error", function() {
                    expect(() => new notificationTestCase.NotificationClass(Buffer.from(notificationTestCase.NotificationBytes))).not.to.throw();
                });
            });
        }
    });
});