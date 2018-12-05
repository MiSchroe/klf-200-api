'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_CS_REMOVE_NODES_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SceneDeleted = this.Data.readUInt8(0) === 1;
    }
}
exports.GW_CS_REMOVE_NODES_CFM = GW_CS_REMOVE_NODES_CFM;
//# sourceMappingURL=GW_CS_REMOVE_NODES_CFM.js.map