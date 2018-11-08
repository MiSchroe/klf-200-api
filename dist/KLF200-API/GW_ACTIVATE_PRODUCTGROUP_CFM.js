'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_ACTIVATE_PRODUCTGROUP_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
}
exports.GW_ACTIVATE_PRODUCTGROUP_CFM = GW_ACTIVATE_PRODUCTGROUP_CFM;
//# sourceMappingURL=GW_ACTIVATE_PRODUCTGROUP_CFM.js.map