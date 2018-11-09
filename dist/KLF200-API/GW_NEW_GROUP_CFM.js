'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_NEW_GROUP_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.GroupID = this.Data.readUInt8(1);
    }
}
exports.GW_NEW_GROUP_CFM = GW_NEW_GROUP_CFM;
//# sourceMappingURL=GW_NEW_GROUP_CFM.js.map