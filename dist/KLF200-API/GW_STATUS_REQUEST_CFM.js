'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_STATUS_REQUEST_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.CommandStatus = this.Data.readUInt8(2);
    }
}
exports.GW_STATUS_REQUEST_CFM = GW_STATUS_REQUEST_CFM;
//# sourceMappingURL=GW_STATUS_REQUEST_CFM.js.map