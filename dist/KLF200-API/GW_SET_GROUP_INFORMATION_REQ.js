'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_SET_GROUP_INFORMATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(GroupID, Revision, Name, GroupType, Nodes, Order = 0, Placement = 0, Velocity = 0, NodeVariation = 0) {
        super(99);
        this.GroupID = GroupID;
        this.Revision = Revision;
        this.Name = Name;
        this.GroupType = GroupType;
        this.Nodes = Nodes;
        this.Order = Order;
        this.Placement = Placement;
        this.Velocity = Velocity;
        this.NodeVariation = NodeVariation;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.GroupID, 0);
        buff.writeUInt16BE(this.Order, 1);
        buff.writeUInt8(this.Placement, 3);
        buff.write(this.Name, 4, 64, "utf8");
        buff.writeUInt8(this.Velocity, 68);
        buff.writeUInt8(this.NodeVariation, 69);
        buff.writeUInt8(this.GroupType, 70);
        buff.writeUInt8(this.Nodes.length, 71);
        BitArray_1.arrayToBitArray(this.Nodes, 25, buff.slice(72, 97));
        buff.writeUInt16BE(this.Revision, 97);
    }
}
exports.GW_SET_GROUP_INFORMATION_REQ = GW_SET_GROUP_INFORMATION_REQ;
