'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_DELETE_SCENE_REQ extends common_1.GW_FRAME_REQ {
    constructor(SceneID) {
        super();
        this.SceneID = SceneID;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.SceneID, 0);
    }
    InitializeBuffer() {
        this.AllocBuffer(1);
    }
}
exports.GW_DELETE_SCENE_REQ = GW_DELETE_SCENE_REQ;
//# sourceMappingURL=GW_DELETE_SCENE_REQ.js.map