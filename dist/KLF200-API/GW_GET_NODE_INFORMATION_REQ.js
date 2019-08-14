"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_NODE_INFORMATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeID) {
        super(1);
        this.NodeID = NodeID;
        this.Data.writeUInt8(this.NodeID, this.offset);
    }
}
exports.GW_GET_NODE_INFORMATION_REQ = GW_GET_NODE_INFORMATION_REQ;
//# sourceMappingURL=GW_GET_NODE_INFORMATION_REQ.js.map