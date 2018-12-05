'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
class GW_STATUS_REQUEST_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.StatusOwner = this.Data.readUInt8(2);
        this.NodeID = this.Data.readUInt8(3);
        this.RunStatus = this.Data.readUInt8(4);
        this.StatusReply = this.Data.readUInt8(5);
        this.StatusType = this.Data.readUInt8(6);
        switch (this.StatusType) {
            case GW_COMMAND_1.StatusType.RequestMainInfo:
                this.TargetPosition = this.Data.readUInt16BE(7);
                this.CurrentPosition = this.Data.readUInt16BE(9);
                this.RemainingTime = this.Data.readUInt16BE(11);
                this.LastMasterExecutionAddress = this.Data.readUInt32BE(13);
                this.LastCommandOriginator = this.Data.readUInt8(17);
                break;
            case GW_COMMAND_1.StatusType.RequestTargetPosition:
            case GW_COMMAND_1.StatusType.RequestCurrentPosition:
            case GW_COMMAND_1.StatusType.RequestRemainingTime:
                const statusCount = this.Data.readUInt8(7);
                this.ParameterData = [];
                for (let statusIndex = 0; statusIndex < statusCount; statusIndex++) {
                    this.ParameterData.push({
                        ID: this.Data.readUInt8(statusIndex * 3 + 8),
                        Value: this.Data.readUInt16BE(statusIndex * 3 + 9)
                    });
                }
                break;
            default:
                throw "Unknown StatusType.";
        }
    }
}
exports.GW_STATUS_REQUEST_NTF = GW_STATUS_REQUEST_NTF;
//# sourceMappingURL=GW_STATUS_REQUEST_NTF.js.map