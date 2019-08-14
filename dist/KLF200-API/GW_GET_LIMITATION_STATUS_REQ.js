"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const util_1 = require("util");
class GW_GET_LIMITATION_STATUS_REQ extends common_1.GW_FRAME_COMMAND_REQ {
    constructor(Nodes, LimitationType, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0) {
        super(27);
        this.Nodes = Nodes;
        this.LimitationType = LimitationType;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.ParameterActive = ParameterActive;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.ParameterActive, 25);
        buff.writeUInt8(this.LimitationType, 26);
        // Multiple nodes are provided
        if (util_1.isArray(this.Nodes)) {
            if (this.Nodes.length > 20)
                throw new Error("Too many nodes.");
            buff.writeUInt8(this.Nodes.length, 4);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 5 + nodeIndex);
            }
        }
        else {
            buff.writeUInt8(1, 4);
            buff.writeUInt8(this.Nodes, 5);
        }
    }
}
exports.GW_GET_LIMITATION_STATUS_REQ = GW_GET_LIMITATION_STATUS_REQ;
//# sourceMappingURL=GW_GET_LIMITATION_STATUS_REQ.js.map