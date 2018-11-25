'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GROUP_DELETED_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.GroupID = this.Data.readUInt8(0);
    }
}
exports.GW_GROUP_DELETED_NTF = GW_GROUP_DELETED_NTF;
