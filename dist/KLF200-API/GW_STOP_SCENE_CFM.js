'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_STOP_SCENE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.SessionID = this.Data.readUInt16BE(1);
    }
}
exports.GW_STOP_SCENE_CFM = GW_STOP_SCENE_CFM;
//# sourceMappingURL=GW_STOP_SCENE_CFM.js.map