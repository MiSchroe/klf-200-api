"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_NODE_ORDER_AND_PLACEMENT_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeID, Order, Placement) {
        super(4);
        this.NodeID = NodeID;
        this.Order = Order;
        this.Placement = Placement;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.writeUInt16BE(this.Order, 1);
        buff.writeUInt8(this.Placement, 3);
    }
}
exports.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ = GW_SET_NODE_ORDER_AND_PLACEMENT_REQ;
//# sourceMappingURL=GW_SET_NODE_ORDER_AND_PLACEMENT_REQ.js.map