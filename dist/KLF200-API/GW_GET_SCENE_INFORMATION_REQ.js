'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_SCENE_INFORMATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(SceneID) {
        super(1);
        this.SceneID = SceneID;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.SceneID, 0);
    }
}
exports.GW_GET_SCENE_INFORMATION_REQ = GW_GET_SCENE_INFORMATION_REQ;
