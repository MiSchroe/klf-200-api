'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_ACTIVATION_LOG_LINE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.TimeStamp = new Date(this.Data.readUInt32BE(0));
        this.SessionID = this.Data.readUInt16BE(4);
        this.StatusOwner = this.Data.readUInt8(6);
        this.NodeID = this.Data.readUInt8(7);
        this.NodeParameter = this.Data.readUInt8(8);
        this.ParameterValue = this.Data.readUInt16BE(9);
        this.RunStatus = this.Data.readUInt8(11);
        this.StatusReply = this.Data.readUInt8(12);
        this.InformationCode = this.Data.readUInt32BE(13);
    }
}
exports.GW_GET_ACTIVATION_LOG_LINE_CFM = GW_GET_ACTIVATION_LOG_LINE_CFM;
//# sourceMappingURL=GW_GET_ACTIVATION_LOG_LINE_CFM.js.map