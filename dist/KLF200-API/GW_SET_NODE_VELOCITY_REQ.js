'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_NODE_VELOCITY_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeID, Velocity) {
        super();
        this.NodeID = NodeID;
        this.Velocity = Velocity;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.writeUInt8(this.Velocity, 1);
    }
    InitializeBuffer() {
        this.AllocBuffer(2);
    }
}
exports.GW_SET_NODE_VELOCITY_REQ = GW_SET_NODE_VELOCITY_REQ;
//# sourceMappingURL=GW_SET_NODE_VELOCITY_REQ.js.map