'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
const util_1 = require("util");
class GW_MODE_SEND_REQ extends common_1.GW_FRAME_COMMAND_REQ {
    constructor(Nodes, ModeNumber = 0, ModeParameter = 0, PriorityLevel = 3, CommandOriginator = 1, PriorityLevelLock = 0, PriorityLevels = [], LockTime = Infinity) {
        super(31);
        this.Nodes = Nodes;
        this.ModeNumber = ModeNumber;
        this.ModeParameter = ModeParameter;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.PriorityLevelLock = PriorityLevelLock;
        this.PriorityLevels = PriorityLevels;
        this.LockTime = LockTime;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.ModeNumber, 4);
        buff.writeUInt8(this.ModeParameter, 5);
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
        buff.writeUInt8(this.PriorityLevelLock, 27);
        if (this.PriorityLevels.length > 8)
            throw "Too many priority levels.";
        let PLI = 0;
        for (let pliIndex = 0; pliIndex < this.PriorityLevels.length; pliIndex++) {
            const pli = this.PriorityLevels[pliIndex];
            if (pli < 0 || pli > 3)
                throw "Priority level lock out of range.";
            PLI <<= 2;
            PLI |= pli;
        }
        PLI <<= 2 * (8 - this.PriorityLevels.length); // Shift remaining, if provided priority leves are less than 8
        buff.writeUInt16BE(PLI, 28);
        buff.writeUInt8(GW_COMMAND_1.LockTime.lockTimeTolockTimeValue(this.LockTime), 30);
    }
}
exports.GW_MODE_SEND_REQ = GW_MODE_SEND_REQ;
