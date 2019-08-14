"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_NODE_NAME_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeID, Name) {
        super(65);
        this.NodeID = NodeID;
        this.Name = Name;
        if (this.Name.length > 64) {
            throw new Error("Name too long. Max. 64 characters allowed.");
        }
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.write(this.Name, 1, 64, "utf8");
    }
}
exports.GW_SET_NODE_NAME_REQ = GW_SET_NODE_NAME_REQ;
//# sourceMappingURL=GW_SET_NODE_NAME_REQ.js.map