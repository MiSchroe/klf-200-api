'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.KLF200_PORT = 51200;
var GatewayCommand;
(function (GatewayCommand) {
    GatewayCommand[GatewayCommand["GW_ERROR_NTF"] = 0] = "GW_ERROR_NTF";
    GatewayCommand[GatewayCommand["GW_REBOOT_REQ"] = 1] = "GW_REBOOT_REQ";
    GatewayCommand[GatewayCommand["GW_REBOOT_CFM"] = 2] = "GW_REBOOT_CFM";
    GatewayCommand[GatewayCommand["GW_SET_FACTORY_DEFAULT_REQ"] = 3] = "GW_SET_FACTORY_DEFAULT_REQ";
    GatewayCommand[GatewayCommand["GW_SET_FACTORY_DEFAULT_CFM"] = 4] = "GW_SET_FACTORY_DEFAULT_CFM";
    GatewayCommand[GatewayCommand["GW_GET_VERSION_REQ"] = 8] = "GW_GET_VERSION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_VERSION_CFM"] = 9] = "GW_GET_VERSION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_PROTOCOL_VERSION_REQ"] = 10] = "GW_GET_PROTOCOL_VERSION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_PROTOCOL_VERSION_CFM"] = 11] = "GW_GET_PROTOCOL_VERSION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_STATE_REQ"] = 12] = "GW_GET_STATE_REQ";
    GatewayCommand[GatewayCommand["GW_GET_STATE_CFM"] = 13] = "GW_GET_STATE_CFM";
    GatewayCommand[GatewayCommand["GW_LEAVE_LEARN_STATE_REQ"] = 14] = "GW_LEAVE_LEARN_STATE_REQ";
    GatewayCommand[GatewayCommand["GW_LEAVE_LEARN_STATE_CFM"] = 15] = "GW_LEAVE_LEARN_STATE_CFM";
    GatewayCommand[GatewayCommand["GW_GET_NETWORK_SETUP_REQ"] = 224] = "GW_GET_NETWORK_SETUP_REQ";
    GatewayCommand[GatewayCommand["GW_GET_NETWORK_SETUP_CFM"] = 225] = "GW_GET_NETWORK_SETUP_CFM";
    GatewayCommand[GatewayCommand["GW_SET_NETWORK_SETUP_REQ"] = 226] = "GW_SET_NETWORK_SETUP_REQ";
    GatewayCommand[GatewayCommand["GW_SET_NETWORK_SETUP_CFM"] = 227] = "GW_SET_NETWORK_SETUP_CFM";
    GatewayCommand[GatewayCommand["GW_CS_GET_SYSTEMTABLE_DATA_REQ"] = 256] = "GW_CS_GET_SYSTEMTABLE_DATA_REQ";
    GatewayCommand[GatewayCommand["GW_CS_GET_SYSTEMTABLE_DATA_CFM"] = 257] = "GW_CS_GET_SYSTEMTABLE_DATA_CFM";
    GatewayCommand[GatewayCommand["GW_CS_GET_SYSTEMTABLE_DATA_NTF"] = 258] = "GW_CS_GET_SYSTEMTABLE_DATA_NTF";
    GatewayCommand[GatewayCommand["GW_CS_DISCOVER_NODES_REQ"] = 259] = "GW_CS_DISCOVER_NODES_REQ";
    GatewayCommand[GatewayCommand["GW_CS_DISCOVER_NODES_CFM"] = 260] = "GW_CS_DISCOVER_NODES_CFM";
    GatewayCommand[GatewayCommand["GW_CS_DISCOVER_NODES_NTF"] = 261] = "GW_CS_DISCOVER_NODES_NTF";
    GatewayCommand[GatewayCommand["GW_CS_REMOVE_NODES_REQ"] = 262] = "GW_CS_REMOVE_NODES_REQ";
    GatewayCommand[GatewayCommand["GW_CS_REMOVE_NODES_CFM"] = 263] = "GW_CS_REMOVE_NODES_CFM";
    GatewayCommand[GatewayCommand["GW_CS_VIRGIN_STATE_REQ"] = 264] = "GW_CS_VIRGIN_STATE_REQ";
    GatewayCommand[GatewayCommand["GW_CS_VIRGIN_STATE_CFM"] = 265] = "GW_CS_VIRGIN_STATE_CFM";
    GatewayCommand[GatewayCommand["GW_CS_CONTROLLER_COPY_REQ"] = 266] = "GW_CS_CONTROLLER_COPY_REQ";
    GatewayCommand[GatewayCommand["GW_CS_CONTROLLER_COPY_CFM"] = 267] = "GW_CS_CONTROLLER_COPY_CFM";
    GatewayCommand[GatewayCommand["GW_CS_CONTROLLER_COPY_NTF"] = 268] = "GW_CS_CONTROLLER_COPY_NTF";
    GatewayCommand[GatewayCommand["GW_CS_CONTROLLER_COPY_CANCEL_NTF"] = 269] = "GW_CS_CONTROLLER_COPY_CANCEL_NTF";
    GatewayCommand[GatewayCommand["GW_CS_RECEIVE_KEY_REQ"] = 270] = "GW_CS_RECEIVE_KEY_REQ";
    GatewayCommand[GatewayCommand["GW_CS_RECEIVE_KEY_CFM"] = 271] = "GW_CS_RECEIVE_KEY_CFM";
    GatewayCommand[GatewayCommand["GW_CS_RECEIVE_KEY_NTF"] = 272] = "GW_CS_RECEIVE_KEY_NTF";
    GatewayCommand[GatewayCommand["GW_CS_PGC_JOB_NTF"] = 273] = "GW_CS_PGC_JOB_NTF";
    GatewayCommand[GatewayCommand["GW_CS_SYSTEM_TABLE_UPDATE_NTF"] = 274] = "GW_CS_SYSTEM_TABLE_UPDATE_NTF";
    GatewayCommand[GatewayCommand["GW_CS_GENERATE_NEW_KEY_REQ"] = 275] = "GW_CS_GENERATE_NEW_KEY_REQ";
    GatewayCommand[GatewayCommand["GW_CS_GENERATE_NEW_KEY_CFM"] = 276] = "GW_CS_GENERATE_NEW_KEY_CFM";
    GatewayCommand[GatewayCommand["GW_CS_GENERATE_NEW_KEY_NTF"] = 277] = "GW_CS_GENERATE_NEW_KEY_NTF";
    GatewayCommand[GatewayCommand["GW_CS_REPAIR_KEY_REQ"] = 278] = "GW_CS_REPAIR_KEY_REQ";
    GatewayCommand[GatewayCommand["GW_CS_REPAIR_KEY_CFM"] = 279] = "GW_CS_REPAIR_KEY_CFM";
    GatewayCommand[GatewayCommand["GW_CS_REPAIR_KEY_NTF"] = 280] = "GW_CS_REPAIR_KEY_NTF";
    GatewayCommand[GatewayCommand["GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ"] = 281] = "GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ";
    GatewayCommand[GatewayCommand["GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM"] = 282] = "GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM";
    GatewayCommand[GatewayCommand["GW_GET_NODE_INFORMATION_REQ"] = 512] = "GW_GET_NODE_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_NODE_INFORMATION_CFM"] = 513] = "GW_GET_NODE_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_NODE_INFORMATION_NTF"] = 528] = "GW_GET_NODE_INFORMATION_NTF";
    GatewayCommand[GatewayCommand["GW_GET_ALL_NODES_INFORMATION_REQ"] = 514] = "GW_GET_ALL_NODES_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_ALL_NODES_INFORMATION_CFM"] = 515] = "GW_GET_ALL_NODES_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_ALL_NODES_INFORMATION_NTF"] = 516] = "GW_GET_ALL_NODES_INFORMATION_NTF";
    GatewayCommand[GatewayCommand["GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF"] = 517] = "GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF";
    GatewayCommand[GatewayCommand["GW_SET_NODE_VARIATION_REQ"] = 518] = "GW_SET_NODE_VARIATION_REQ";
    GatewayCommand[GatewayCommand["GW_SET_NODE_VARIATION_CFM"] = 519] = "GW_SET_NODE_VARIATION_CFM";
    GatewayCommand[GatewayCommand["GW_SET_NODE_NAME_REQ"] = 520] = "GW_SET_NODE_NAME_REQ";
    GatewayCommand[GatewayCommand["GW_SET_NODE_NAME_CFM"] = 521] = "GW_SET_NODE_NAME_CFM";
    GatewayCommand[GatewayCommand["GW_SET_NODE_VELOCITY_REQ"] = 522] = "GW_SET_NODE_VELOCITY_REQ";
    GatewayCommand[GatewayCommand["GW_SET_NODE_VELOCITY_CFM"] = 523] = "GW_SET_NODE_VELOCITY_CFM";
    GatewayCommand[GatewayCommand["GW_NODE_INFORMATION_CHANGED_NTF"] = 524] = "GW_NODE_INFORMATION_CHANGED_NTF";
    GatewayCommand[GatewayCommand["GW_NODE_STATE_POSITION_CHANGED_NTF"] = 529] = "GW_NODE_STATE_POSITION_CHANGED_NTF";
    GatewayCommand[GatewayCommand["GW_SET_NODE_ORDER_AND_PLACEMENT_REQ"] = 525] = "GW_SET_NODE_ORDER_AND_PLACEMENT_REQ";
    GatewayCommand[GatewayCommand["GW_SET_NODE_ORDER_AND_PLACEMENT_CFM"] = 526] = "GW_SET_NODE_ORDER_AND_PLACEMENT_CFM";
    GatewayCommand[GatewayCommand["GW_GET_GROUP_INFORMATION_REQ"] = 544] = "GW_GET_GROUP_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_GROUP_INFORMATION_CFM"] = 545] = "GW_GET_GROUP_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_GROUP_INFORMATION_NTF"] = 560] = "GW_GET_GROUP_INFORMATION_NTF";
    GatewayCommand[GatewayCommand["GW_SET_GROUP_INFORMATION_REQ"] = 546] = "GW_SET_GROUP_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_SET_GROUP_INFORMATION_CFM"] = 547] = "GW_SET_GROUP_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GROUP_INFORMATION_CHANGED_NTF"] = 548] = "GW_GROUP_INFORMATION_CHANGED_NTF";
    GatewayCommand[GatewayCommand["GW_DELETE_GROUP_REQ"] = 549] = "GW_DELETE_GROUP_REQ";
    GatewayCommand[GatewayCommand["GW_DELETE_GROUP_CFM"] = 550] = "GW_DELETE_GROUP_CFM";
    GatewayCommand[GatewayCommand["GW_NEW_GROUP_REQ"] = 551] = "GW_NEW_GROUP_REQ";
    GatewayCommand[GatewayCommand["GW_NEW_GROUP_CFM"] = 552] = "GW_NEW_GROUP_CFM";
    GatewayCommand[GatewayCommand["GW_GET_ALL_GROUPS_INFORMATION_REQ"] = 553] = "GW_GET_ALL_GROUPS_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_ALL_GROUPS_INFORMATION_CFM"] = 554] = "GW_GET_ALL_GROUPS_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_ALL_GROUPS_INFORMATION_NTF"] = 555] = "GW_GET_ALL_GROUPS_INFORMATION_NTF";
    GatewayCommand[GatewayCommand["GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF"] = 556] = "GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF";
    GatewayCommand[GatewayCommand["GW_GROUP_DELETED_NTF"] = 557] = "GW_GROUP_DELETED_NTF";
    GatewayCommand[GatewayCommand["GW_HOUSE_STATUS_MONITOR_ENABLE_REQ"] = 576] = "GW_HOUSE_STATUS_MONITOR_ENABLE_REQ";
    GatewayCommand[GatewayCommand["GW_HOUSE_STATUS_MONITOR_ENABLE_CFM"] = 577] = "GW_HOUSE_STATUS_MONITOR_ENABLE_CFM";
    GatewayCommand[GatewayCommand["GW_HOUSE_STATUS_MONITOR_DISABLE_REQ"] = 578] = "GW_HOUSE_STATUS_MONITOR_DISABLE_REQ";
    GatewayCommand[GatewayCommand["GW_HOUSE_STATUS_MONITOR_DISABLE_CFM"] = 579] = "GW_HOUSE_STATUS_MONITOR_DISABLE_CFM";
    GatewayCommand[GatewayCommand["GW_COMMAND_SEND_REQ"] = 768] = "GW_COMMAND_SEND_REQ";
    GatewayCommand[GatewayCommand["GW_COMMAND_SEND_CFM"] = 769] = "GW_COMMAND_SEND_CFM";
    GatewayCommand[GatewayCommand["GW_COMMAND_RUN_STATUS_NTF"] = 770] = "GW_COMMAND_RUN_STATUS_NTF";
    GatewayCommand[GatewayCommand["GW_COMMAND_REMAINING_TIME_NTF"] = 771] = "GW_COMMAND_REMAINING_TIME_NTF";
    GatewayCommand[GatewayCommand["GW_SESSION_FINISHED_NTF"] = 772] = "GW_SESSION_FINISHED_NTF";
    GatewayCommand[GatewayCommand["GW_STATUS_REQUEST_REQ"] = 773] = "GW_STATUS_REQUEST_REQ";
    GatewayCommand[GatewayCommand["GW_STATUS_REQUEST_CFM"] = 774] = "GW_STATUS_REQUEST_CFM";
    GatewayCommand[GatewayCommand["GW_STATUS_REQUEST_NTF"] = 775] = "GW_STATUS_REQUEST_NTF";
    GatewayCommand[GatewayCommand["GW_WINK_SEND_REQ"] = 776] = "GW_WINK_SEND_REQ";
    GatewayCommand[GatewayCommand["GW_WINK_SEND_CFM"] = 777] = "GW_WINK_SEND_CFM";
    GatewayCommand[GatewayCommand["GW_WINK_SEND_NTF"] = 778] = "GW_WINK_SEND_NTF";
    GatewayCommand[GatewayCommand["GW_SET_LIMITATION_REQ"] = 784] = "GW_SET_LIMITATION_REQ";
    GatewayCommand[GatewayCommand["GW_SET_LIMITATION_CFM"] = 785] = "GW_SET_LIMITATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_LIMITATION_STATUS_REQ"] = 786] = "GW_GET_LIMITATION_STATUS_REQ";
    GatewayCommand[GatewayCommand["GW_GET_LIMITATION_STATUS_CFM"] = 787] = "GW_GET_LIMITATION_STATUS_CFM";
    GatewayCommand[GatewayCommand["GW_LIMITATION_STATUS_NTF"] = 788] = "GW_LIMITATION_STATUS_NTF";
    GatewayCommand[GatewayCommand["GW_MODE_SEND_REQ"] = 800] = "GW_MODE_SEND_REQ";
    GatewayCommand[GatewayCommand["GW_MODE_SEND_CFM"] = 801] = "GW_MODE_SEND_CFM";
    GatewayCommand[GatewayCommand["GW_MODE_SEND_NTF"] = 802] = "GW_MODE_SEND_NTF";
    GatewayCommand[GatewayCommand["GW_INITIALIZE_SCENE_REQ"] = 1024] = "GW_INITIALIZE_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_INITIALIZE_SCENE_CFM"] = 1025] = "GW_INITIALIZE_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_INITIALIZE_SCENE_NTF"] = 1026] = "GW_INITIALIZE_SCENE_NTF";
    GatewayCommand[GatewayCommand["GW_INITIALIZE_SCENE_CANCEL_REQ"] = 1027] = "GW_INITIALIZE_SCENE_CANCEL_REQ";
    GatewayCommand[GatewayCommand["GW_INITIALIZE_SCENE_CANCEL_CFM"] = 1028] = "GW_INITIALIZE_SCENE_CANCEL_CFM";
    GatewayCommand[GatewayCommand["GW_RECORD_SCENE_REQ"] = 1029] = "GW_RECORD_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_RECORD_SCENE_CFM"] = 1030] = "GW_RECORD_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_RECORD_SCENE_NTF"] = 1031] = "GW_RECORD_SCENE_NTF";
    GatewayCommand[GatewayCommand["GW_DELETE_SCENE_REQ"] = 1032] = "GW_DELETE_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_DELETE_SCENE_CFM"] = 1033] = "GW_DELETE_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_RENAME_SCENE_REQ"] = 1034] = "GW_RENAME_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_RENAME_SCENE_CFM"] = 1035] = "GW_RENAME_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_LIST_REQ"] = 1036] = "GW_GET_SCENE_LIST_REQ";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_LIST_CFM"] = 1037] = "GW_GET_SCENE_LIST_CFM";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_LIST_NTF"] = 1038] = "GW_GET_SCENE_LIST_NTF";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_INFORMATION_REQ"] = 1039] = "GW_GET_SCENE_INFORMATION_REQ";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_INFORMATION_CFM"] = 1040] = "GW_GET_SCENE_INFORMATION_CFM";
    GatewayCommand[GatewayCommand["GW_GET_SCENE_INFORMATION_NTF"] = 1041] = "GW_GET_SCENE_INFORMATION_NTF";
    GatewayCommand[GatewayCommand["GW_ACTIVATE_SCENE_REQ"] = 1042] = "GW_ACTIVATE_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_ACTIVATE_SCENE_CFM"] = 1043] = "GW_ACTIVATE_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_STOP_SCENE_REQ"] = 1045] = "GW_STOP_SCENE_REQ";
    GatewayCommand[GatewayCommand["GW_STOP_SCENE_CFM"] = 1046] = "GW_STOP_SCENE_CFM";
    GatewayCommand[GatewayCommand["GW_SCENE_INFORMATION_CHANGED_NTF"] = 1049] = "GW_SCENE_INFORMATION_CHANGED_NTF";
    GatewayCommand[GatewayCommand["GW_ACTIVATE_PRODUCTGROUP_REQ"] = 1095] = "GW_ACTIVATE_PRODUCTGROUP_REQ";
    GatewayCommand[GatewayCommand["GW_ACTIVATE_PRODUCTGROUP_CFM"] = 1096] = "GW_ACTIVATE_PRODUCTGROUP_CFM";
    GatewayCommand[GatewayCommand["GW_ACTIVATE_PRODUCTGROUP_NTF"] = 1097] = "GW_ACTIVATE_PRODUCTGROUP_NTF";
    GatewayCommand[GatewayCommand["GW_GET_CONTACT_INPUT_LINK_LIST_REQ"] = 1120] = "GW_GET_CONTACT_INPUT_LINK_LIST_REQ";
    GatewayCommand[GatewayCommand["GW_GET_CONTACT_INPUT_LINK_LIST_CFM"] = 1121] = "GW_GET_CONTACT_INPUT_LINK_LIST_CFM";
    GatewayCommand[GatewayCommand["GW_SET_CONTACT_INPUT_LINK_REQ"] = 1122] = "GW_SET_CONTACT_INPUT_LINK_REQ";
    GatewayCommand[GatewayCommand["GW_SET_CONTACT_INPUT_LINK_CFM"] = 1123] = "GW_SET_CONTACT_INPUT_LINK_CFM";
    GatewayCommand[GatewayCommand["GW_REMOVE_CONTACT_INPUT_LINK_REQ"] = 1124] = "GW_REMOVE_CONTACT_INPUT_LINK_REQ";
    GatewayCommand[GatewayCommand["GW_REMOVE_CONTACT_INPUT_LINK_CFM"] = 1125] = "GW_REMOVE_CONTACT_INPUT_LINK_CFM";
    GatewayCommand[GatewayCommand["GW_GET_ACTIVATION_LOG_HEADER_REQ"] = 1280] = "GW_GET_ACTIVATION_LOG_HEADER_REQ";
    GatewayCommand[GatewayCommand["GW_GET_ACTIVATION_LOG_HEADER_CFM"] = 1281] = "GW_GET_ACTIVATION_LOG_HEADER_CFM";
    GatewayCommand[GatewayCommand["GW_CLEAR_ACTIVATION_LOG_REQ"] = 1282] = "GW_CLEAR_ACTIVATION_LOG_REQ";
    GatewayCommand[GatewayCommand["GW_CLEAR_ACTIVATION_LOG_CFM"] = 1283] = "GW_CLEAR_ACTIVATION_LOG_CFM";
    GatewayCommand[GatewayCommand["GW_GET_ACTIVATION_LOG_LINE_REQ"] = 1284] = "GW_GET_ACTIVATION_LOG_LINE_REQ";
    GatewayCommand[GatewayCommand["GW_GET_ACTIVATION_LOG_LINE_CFM"] = 1285] = "GW_GET_ACTIVATION_LOG_LINE_CFM";
    GatewayCommand[GatewayCommand["GW_ACTIVATION_LOG_UPDATED_NTF"] = 1286] = "GW_ACTIVATION_LOG_UPDATED_NTF";
    GatewayCommand[GatewayCommand["GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ"] = 1287] = "GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ";
    GatewayCommand[GatewayCommand["GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF"] = 1288] = "GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF";
    GatewayCommand[GatewayCommand["GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM"] = 1289] = "GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM";
    GatewayCommand[GatewayCommand["GW_SET_UTC_REQ"] = 8192] = "GW_SET_UTC_REQ";
    GatewayCommand[GatewayCommand["GW_SET_UTC_CFM"] = 8193] = "GW_SET_UTC_CFM";
    GatewayCommand[GatewayCommand["GW_RTC_SET_TIME_ZONE_REQ"] = 8194] = "GW_RTC_SET_TIME_ZONE_REQ";
    GatewayCommand[GatewayCommand["GW_RTC_SET_TIME_ZONE_CFM"] = 8195] = "GW_RTC_SET_TIME_ZONE_CFM";
    GatewayCommand[GatewayCommand["GW_GET_LOCAL_TIME_REQ"] = 8196] = "GW_GET_LOCAL_TIME_REQ";
    GatewayCommand[GatewayCommand["GW_GET_LOCAL_TIME_CFM"] = 8197] = "GW_GET_LOCAL_TIME_CFM";
    GatewayCommand[GatewayCommand["GW_PASSWORD_ENTER_REQ"] = 12288] = "GW_PASSWORD_ENTER_REQ";
    GatewayCommand[GatewayCommand["GW_PASSWORD_ENTER_CFM"] = 12289] = "GW_PASSWORD_ENTER_CFM";
    GatewayCommand[GatewayCommand["GW_PASSWORD_CHANGE_REQ"] = 12290] = "GW_PASSWORD_CHANGE_REQ";
    GatewayCommand[GatewayCommand["GW_PASSWORD_CHANGE_CFM"] = 12291] = "GW_PASSWORD_CHANGE_CFM";
    GatewayCommand[GatewayCommand["GW_PASSWORD_CHANGE_NTF"] = 12292] = "GW_PASSWORD_CHANGE_NTF"; // Acknowledge to GW_PASSWORD_CHANGE_REQ. Broadcasted to all connected clients.
})(GatewayCommand = exports.GatewayCommand || (exports.GatewayCommand = {}));
var GW_COMMON_STATUS;
(function (GW_COMMON_STATUS) {
    GW_COMMON_STATUS[GW_COMMON_STATUS["SUCCESS"] = 0] = "SUCCESS";
    GW_COMMON_STATUS[GW_COMMON_STATUS["ERROR"] = 1] = "ERROR";
    GW_COMMON_STATUS[GW_COMMON_STATUS["INVALID_NODE_ID"] = 2] = "INVALID_NODE_ID";
})(GW_COMMON_STATUS = exports.GW_COMMON_STATUS || (exports.GW_COMMON_STATUS = {}));
var GW_INVERSE_STATUS;
(function (GW_INVERSE_STATUS) {
    GW_INVERSE_STATUS[GW_INVERSE_STATUS["ERROR"] = 0] = "ERROR";
    GW_INVERSE_STATUS[GW_INVERSE_STATUS["SUCCESS"] = 1] = "SUCCESS";
})(GW_INVERSE_STATUS = exports.GW_INVERSE_STATUS || (exports.GW_INVERSE_STATUS = {}));
const C_COMMAND_SIZE = 2;
const C_BUFFERLEN_SIZE = 1;
exports.C_MAX_PWD_LENGTH = 32;
class GW_FRAME {
    constructor() {
        this.Command = GatewayCommand[this.constructor.name];
        this.offset = C_BUFFERLEN_SIZE + C_COMMAND_SIZE;
    }
}
exports.GW_FRAME = GW_FRAME;
class GW_FRAME_REQ extends GW_FRAME {
    /**
     * Allocates a buffer in the right size for the frame.
     * The first byte contains the buffer length.
     * The next two bytes of the buffer are used for the command.
     * The remaining bytes are for the data.
     *
     * A size of 0 means that the command has no further data.
     *
     * @protected
     * @abstract
     * @param {number} BufferSize Size for the buffer for the data part without length and command.
     * @param {boolean} CopyData Set to true to copy the data in case of reallocating the buffer. Default is true.
     * @memberof GW_FRAME
     */
    AllocBuffer(BufferSize, CopyData = true) {
        const oldData = this.data;
        this.data = Buffer.alloc(BufferSize + this.offset);
        this.data.writeUInt16BE(this.Command, C_BUFFERLEN_SIZE);
        this.data.writeUInt8(this.data.byteLength, 0);
        if (typeof oldData !== "undefined" && CopyData === true) {
            // Copy old data into new buffer
            const copyBufferLength = Math.min(oldData.byteLength, this.data.byteLength) - this.offset;
            if (copyBufferLength > 0) {
                oldData.copy(this.data, this.offset, this.offset, this.offset + copyBufferLength);
            }
        }
    }
    get Data() {
        if (typeof this.data === "undefined")
            this.InitializeBuffer();
        return this.data;
    }
}
exports.GW_FRAME_REQ = GW_FRAME_REQ;
class GW_FRAME_RCV extends GW_FRAME {
    constructor(Data) {
        super();
        this.Data = Data;
        const command = Data.readUInt16BE(C_BUFFERLEN_SIZE);
        // Check command
        this.CheckCommand(command);
        // Remove command and length from Buffer
        this.Data = Data.slice(C_BUFFERLEN_SIZE + C_COMMAND_SIZE);
    }
    CheckCommand(command) {
        //const className = <keyof typeof GatewayCommand>this.constructor.name;
        if (command !== this.Command)
            throw `Command from buffer (${command}) doesn't match command of frame (${this.Command}).`;
    }
}
exports.GW_FRAME_RCV = GW_FRAME_RCV;
class GW_FRAME_CFM extends GW_FRAME_RCV {
}
exports.GW_FRAME_CFM = GW_FRAME_CFM;
class GW_FRAME_NTF extends GW_FRAME_RCV {
}
exports.GW_FRAME_NTF = GW_FRAME_NTF;
/**
 * Reads a zero-terminated string from the buffer.
 *
 * @export
 * @param {Buffer} data The buffer that contains the string data.
 * @returns {string} Returns the string data.
 */
function readZString(data) {
    return data.toString("utf8").split("\0", 1)[0];
}
exports.readZString = readZString;
class KLF200Protocol {
    static Encode(data) {
        const result = Buffer.alloc(data.byteLength + 2); // +1 for ProtocolID and +1 for CRC byte
        // Set ProtocolID
        result.writeUInt8(this.ProtocolID, 0);
        // Write data
        data.copy(result, 1);
        // Calculate CRC
        let CRC = 0;
        for (let index = 0; index < result.byteLength - 1; index++) {
            CRC ^= result[index];
        }
        // Write CRC
        result.writeUInt8(CRC, result.byteLength - 1);
        return result;
    }
    static Decode(data) {
        // Check ProtocolID
        if (data[0] !== this.ProtocolID) {
            throw "Invalid ProtocolID.";
        }
        // Calculate CRC
        let CRC = 0;
        for (let index = 0; index < data.byteLength - 1; index++) {
            CRC ^= data[index];
        }
        if (CRC !== data[data.byteLength - 1]) {
            throw "CRC error";
        }
        const result = Buffer.alloc(data.byteLength - 2);
        data.copy(result, 0, 1, data.byteLength - 1);
        return result;
    }
}
KLF200Protocol.ProtocolID = 0;
exports.KLF200Protocol = KLF200Protocol;
exports.SLIP_END = 0xC0;
const SLIP_ESC = 0xDB;
const SLIP_ESC_END = 0xDC;
const SLIP_ESC_ESC = 0xDD;
class SLIPProtocol {
    static Encode(data) {
        const resultBuffer = Buffer.alloc(data.byteLength * 2 + 2); // Max. possible size if all bytes have to be prefixed
        let resultLength = 0;
        // Write END mark
        resultBuffer[resultLength++] = exports.SLIP_END;
        // Mask END and ESC characters
        for (let i = 0; i < data.byteLength; i++) {
            const dataByte = data[i];
            switch (dataByte) {
                case exports.SLIP_END:
                    resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                    resultBuffer.writeUInt8(SLIP_ESC_END, resultLength++);
                    break;
                case SLIP_ESC:
                    resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                    resultBuffer.writeUInt8(SLIP_ESC_ESC, resultLength++);
                    break;
                default:
                    resultBuffer.writeUInt8(dataByte, resultLength++);
                    break;
            }
        }
        // Write END mark
        resultBuffer[resultLength++] = exports.SLIP_END;
        return resultBuffer.slice(0, resultLength);
    }
    static Decode(data) {
        // Check END mark at start and END
        if (data[0] !== exports.SLIP_END || data[data.byteLength - 1] !== exports.SLIP_END)
            throw "Missing END mark.";
        const resultBuffer = Buffer.alloc(data.byteLength - 2); // Max. possible size without END mark at start and end
        let resultLength = 0;
        for (let i = 1; i < data.byteLength - 1; i++) {
            const dataByte = data[i];
            switch (dataByte) {
                case SLIP_ESC:
                    const nextDataByte = data[++i];
                    switch (nextDataByte) {
                        case SLIP_ESC_ESC:
                            resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                            break;
                        case SLIP_ESC_END:
                            resultBuffer.writeUInt8(exports.SLIP_END, resultLength++);
                            break;
                        default:
                            throw "Invalid SLIP special character.";
                    }
                    break;
                default:
                    resultBuffer.writeUInt8(dataByte, resultLength++);
                    break;
            }
        }
        return resultBuffer.slice(0, resultLength);
    }
}
exports.SLIPProtocol = SLIPProtocol;
//# sourceMappingURL=common.js.map