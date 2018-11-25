'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_RECORD_SCENE_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }
}
exports.GW_RECORD_SCENE_NTF = GW_RECORD_SCENE_NTF;
