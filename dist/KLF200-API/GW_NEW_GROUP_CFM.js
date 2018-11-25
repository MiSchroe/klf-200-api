'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_NEW_GROUP_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.GroupID = this.Data.readUInt8(1);
    }
    getError() {
        switch (this.Status) {
            case common_1.GW_COMMON_STATUS.SUCCESS:
                throw new Error("No error.");
            case common_1.GW_COMMON_STATUS.ERROR:
                return "Request failed.";
            case common_1.GW_COMMON_STATUS.INVALID_NODE_ID:
                return "Invalid group ID.";
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
exports.GW_NEW_GROUP_CFM = GW_NEW_GROUP_CFM;
//# sourceMappingURL=GW_NEW_GROUP_CFM.js.map