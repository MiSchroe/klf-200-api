'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
const util_1 = require("util");
class GW_SET_LIMITATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(Nodes, LimitationValueMin, LimitationValueMax, LimitationTime, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0) {
        super();
        this.Nodes = Nodes;
        this.LimitationValueMin = LimitationValueMin;
        this.LimitationValueMax = LimitationValueMax;
        this.LimitationTime = LimitationTime;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.ParameterActive = ParameterActive;
        this.SessionID = GW_COMMAND_1.getNextSessionID();
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.ParameterActive, 25);
        buff.writeUInt16BE(this.LimitationValueMin, 26);
        buff.writeUInt16BE(this.LimitationValueMax, 28);
        buff.writeUInt8(this.LimitationTime, 30);
        // Multiple nodes are provided
        if (util_1.isArray(this.Nodes)) {
            if (this.Nodes.length > 20)
                throw "Too many nodes.";
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
    InitializeBuffer() {
        this.AllocBuffer(31);
    }
}
exports.GW_SET_LIMITATION_REQ = GW_SET_LIMITATION_REQ;
//# sourceMappingURL=GW_SET_LIMITATION_REQ.js.map