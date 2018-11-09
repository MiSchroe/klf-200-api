'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_NEW_GROUP_REQ extends common_1.GW_FRAME_REQ {
    constructor(Name, GroupType, Nodes, Order = 0, Placement = 0, Velocity = 0, NodeVariation = 0) {
        super();
        this.Name = Name;
        this.GroupType = GroupType;
        this.Nodes = Nodes;
        this.Order = Order;
        this.Placement = Placement;
        this.Velocity = Velocity;
        this.NodeVariation = NodeVariation;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt16BE(this.Order, 0);
        buff.writeUInt8(this.Placement, 2);
        buff.write(this.Name, 3, 64, "utf8");
        buff.writeUInt8(this.Velocity, 67);
        buff.writeUInt8(this.NodeVariation, 68);
        buff.writeUInt8(this.GroupType, 69);
        buff.writeUInt8(this.Nodes.length, 70);
        BitArray_1.arrayToBitArray(this.Nodes, 25, buff.slice(71, 96));
    }
    InitializeBuffer() {
        this.AllocBuffer(96);
    }
}
exports.GW_NEW_GROUP_REQ = GW_NEW_GROUP_REQ;
//# sourceMappingURL=GW_NEW_GROUP_REQ.js.map