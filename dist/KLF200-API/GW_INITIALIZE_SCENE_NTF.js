"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_INITIALIZE_SCENE_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.FailedNodes = BitArray_1.bitArrayToArray(this.Data.slice(1, 26));
    }
}
exports.GW_INITIALIZE_SCENE_NTF = GW_INITIALIZE_SCENE_NTF;
//# sourceMappingURL=GW_INITIALIZE_SCENE_NTF.js.map