'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.LineCount = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
}
exports.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM = GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM;
//# sourceMappingURL=GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM.js.map