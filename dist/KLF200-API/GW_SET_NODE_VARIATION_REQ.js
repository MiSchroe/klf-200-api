'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_NODE_VARIATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeID, NodeVariation = 0) {
        super(2);
        this.NodeID = NodeID;
        this.NodeVariation = NodeVariation;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.writeUInt8(this.NodeVariation, 1);
    }
}
exports.GW_SET_NODE_VARIATION_REQ = GW_SET_NODE_VARIATION_REQ;
