'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_NODE_INFORMATION_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        const status = this.Data.readUInt8(0);
        this.Status = status;
        this.NodeID = this.Data.readUInt8(1);
    }
}
exports.GW_GET_NODE_INFORMATION_CFM = GW_GET_NODE_INFORMATION_CFM;
//# sourceMappingURL=GW_GET_NODE_INFORMATION_CFM.js.map