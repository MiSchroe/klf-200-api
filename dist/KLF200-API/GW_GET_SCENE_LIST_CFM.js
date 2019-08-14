"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_SCENE_LIST_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.NumberOfScenes = this.Data.readUInt8(0);
    }
}
exports.GW_GET_SCENE_LIST_CFM = GW_GET_SCENE_LIST_CFM;
//# sourceMappingURL=GW_GET_SCENE_LIST_CFM.js.map