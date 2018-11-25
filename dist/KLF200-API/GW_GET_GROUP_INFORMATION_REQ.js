'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_GROUP_INFORMATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(GroupID) {
        super(1);
        this.GroupID = GroupID;
        this.Data.writeUInt8(this.GroupID, this.offset);
    }
}
exports.GW_GET_GROUP_INFORMATION_REQ = GW_GET_GROUP_INFORMATION_REQ;
