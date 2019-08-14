"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
class GW_MODE_SEND_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.ModeStatus = this.Data.readUInt8(2);
    }
    getError() {
        switch (this.ModeStatus) {
            case GW_COMMAND_1.ModeStatus.OK:
                throw new Error("No error.");
            case GW_COMMAND_1.ModeStatus.CommandRejected:
                return "Command rejected.";
            case GW_COMMAND_1.ModeStatus.UnknownClientID:
                return "Unknown client ID.";
            case GW_COMMAND_1.ModeStatus.SessionIDInUse:
                return "Session ID in use.";
            case GW_COMMAND_1.ModeStatus.Busy:
                return "Busy.";
            case GW_COMMAND_1.ModeStatus.IllegalParameterValue:
                return "Invalid parameter value.";
            case GW_COMMAND_1.ModeStatus.Failed:
                return "Failed.";
            default:
                return `Unknown error ${this.ModeStatus}.`;
        }
    }
}
exports.GW_MODE_SEND_CFM = GW_MODE_SEND_CFM;
//# sourceMappingURL=GW_MODE_SEND_CFM.js.map