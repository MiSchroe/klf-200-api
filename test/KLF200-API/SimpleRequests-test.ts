"use strict";

import { expect, use } from "chai";
import chaiBytes from "chai-bytes";
import 'mocha';
import { GatewayCommand, GW_REBOOT_REQ, GW_SET_FACTORY_DEFAULT_REQ, GW_GET_VERSION_REQ, GW_GET_PROTOCOL_VERSION_REQ, GW_GET_STATE_REQ, GW_LEAVE_LEARN_STATE_REQ, GW_GET_NETWORK_SETUP_REQ, GW_CS_GET_SYSTEMTABLE_DATA_REQ, GW_CS_DISCOVER_NODES_REQ, GW_CS_VIRGIN_STATE_REQ, GW_CS_CONTROLLER_COPY_CANCEL_NTF, GW_CS_RECEIVE_KEY_REQ, GW_CS_GENERATE_NEW_KEY_REQ, GW_CS_REPAIR_KEY_REQ, GW_GET_ALL_NODES_INFORMATION_REQ, GW_GET_ALL_GROUPS_INFORMATION_REQ, GW_HOUSE_STATUS_MONITOR_ENABLE_REQ, GW_HOUSE_STATUS_MONITOR_DISABLE_REQ, GW_INITIALIZE_SCENE_REQ, GW_INITIALIZE_SCENE_CANCEL_REQ, GW_GET_SCENE_LIST_REQ, GW_GET_CONTACT_INPUT_LINK_LIST_REQ, GW_GET_ACTIVATION_LOG_HEADER_REQ, GW_CLEAR_ACTIVATION_LOG_REQ, GW_SET_UTC_REQ, GW_GET_LOCAL_TIME_REQ, IGW_FRAME_REQ } from "../../src";

use(chaiBytes);

type requestListEntryType = {
    RequestClass: IGW_FRAME_REQ,
    RequestCommand: GatewayCommand
}

const simpleRequests: requestListEntryType[] = [
    { RequestClass: new GW_REBOOT_REQ(), RequestCommand: GatewayCommand.GW_REBOOT_REQ },
    { RequestClass: new GW_SET_FACTORY_DEFAULT_REQ(), RequestCommand: GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ },
    { RequestClass: new GW_GET_VERSION_REQ(), RequestCommand: GatewayCommand.GW_GET_VERSION_REQ },
    { RequestClass: new GW_GET_PROTOCOL_VERSION_REQ(), RequestCommand: GatewayCommand.GW_GET_PROTOCOL_VERSION_REQ },
    { RequestClass: new GW_GET_STATE_REQ(), RequestCommand: GatewayCommand.GW_GET_STATE_REQ },
    { RequestClass: new GW_LEAVE_LEARN_STATE_REQ(), RequestCommand: GatewayCommand.GW_LEAVE_LEARN_STATE_REQ },
    { RequestClass: new GW_GET_NETWORK_SETUP_REQ(), RequestCommand: GatewayCommand.GW_GET_NETWORK_SETUP_REQ },
    { RequestClass: new GW_CS_GET_SYSTEMTABLE_DATA_REQ(), RequestCommand: GatewayCommand.GW_CS_GET_SYSTEMTABLE_DATA_REQ },
    { RequestClass: new GW_CS_VIRGIN_STATE_REQ(), RequestCommand: GatewayCommand.GW_CS_VIRGIN_STATE_REQ },
    { RequestClass: new GW_CS_CONTROLLER_COPY_CANCEL_NTF(), RequestCommand: GatewayCommand.GW_CS_CONTROLLER_COPY_CANCEL_NTF },
    { RequestClass: new GW_CS_RECEIVE_KEY_REQ(), RequestCommand: GatewayCommand.GW_CS_RECEIVE_KEY_REQ },
    { RequestClass: new GW_CS_GENERATE_NEW_KEY_REQ(), RequestCommand: GatewayCommand.GW_CS_GENERATE_NEW_KEY_REQ },
    { RequestClass: new GW_CS_REPAIR_KEY_REQ(), RequestCommand: GatewayCommand.GW_CS_REPAIR_KEY_REQ },
    { RequestClass: new GW_GET_ALL_NODES_INFORMATION_REQ(), RequestCommand: GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ },
    { RequestClass: new GW_HOUSE_STATUS_MONITOR_ENABLE_REQ(), RequestCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ },
    { RequestClass: new GW_HOUSE_STATUS_MONITOR_DISABLE_REQ(), RequestCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ },
    { RequestClass: new GW_INITIALIZE_SCENE_REQ(), RequestCommand: GatewayCommand.GW_INITIALIZE_SCENE_REQ },
    { RequestClass: new GW_INITIALIZE_SCENE_CANCEL_REQ(), RequestCommand: GatewayCommand.GW_INITIALIZE_SCENE_CANCEL_REQ },
    { RequestClass: new GW_GET_SCENE_LIST_REQ(), RequestCommand: GatewayCommand.GW_GET_SCENE_LIST_REQ },
    { RequestClass: new GW_GET_CONTACT_INPUT_LINK_LIST_REQ(), RequestCommand: GatewayCommand.GW_GET_CONTACT_INPUT_LINK_LIST_REQ },
    { RequestClass: new GW_GET_ACTIVATION_LOG_HEADER_REQ(), RequestCommand: GatewayCommand.GW_GET_ACTIVATION_LOG_HEADER_REQ },
    { RequestClass: new GW_CLEAR_ACTIVATION_LOG_REQ(), RequestCommand: GatewayCommand.GW_CLEAR_ACTIVATION_LOG_REQ },
    { RequestClass: new GW_GET_LOCAL_TIME_REQ(), RequestCommand: GatewayCommand.GW_GET_LOCAL_TIME_REQ }
];

describe("KLF200-API", function() {
    describe("Simple Requests", function() {
        for (const request of simpleRequests) {
            describe(request.RequestClass.constructor.name, function() {
                it("should have the right command and a length byte of 3", function() {
                    const expectedBuffer = Buffer.from([3, 0, 0]);
                    expectedBuffer.writeInt16BE(request.RequestCommand, 1);
                    expect(request.RequestClass.Command).to.be.equal(request.RequestCommand);
                    expect(request.RequestClass.Data).to.be.equalBytes(expectedBuffer);
                });
            });
        }
    });
});