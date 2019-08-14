"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_COMMAND_REMAINING_TIME_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.NodeID = this.Data.readUInt8(2);
        this.NodeParameter = this.Data.readUInt8(3);
        this.RemainingTime = this.Data.readUInt16BE(4);
    }
}
exports.GW_COMMAND_REMAINING_TIME_NTF = GW_COMMAND_REMAINING_TIME_NTF;
//# sourceMappingURL=GW_COMMAND_REMAINING_TIME_NTF.js.map