'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
const util_1 = require("util");
class GW_WINK_SEND_REQ extends common_1.GW_FRAME_REQ {
    constructor(Nodes, EnableWink = true, WinkTime = 254, PriorityLevel = 3, CommandOriginator = 1) {
        super();
        this.Nodes = Nodes;
        this.EnableWink = EnableWink;
        this.WinkTime = WinkTime;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.SessionID = GW_COMMAND_1.getNextSessionID();
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.EnableWink ? 1 : 0, 4);
        buff.writeUInt8(this.WinkTime, 5);
        // Multiple nodes are provided
        if (util_1.isArray(this.Nodes)) {
            if (this.Nodes.length > 20)
                throw "Too many nodes.";
            buff.writeUInt8(this.Nodes.length, 6);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 7 + nodeIndex);
            }
        }
        else {
            buff.writeUInt8(1, 6);
            buff.writeUInt8(this.Nodes, 7);
        }
    }
    InitializeBuffer() {
        this.AllocBuffer(27);
    }
}
exports.GW_WINK_SEND_REQ = GW_WINK_SEND_REQ;
//# sourceMappingURL=GW_WINK_SEND_REQ.js.map