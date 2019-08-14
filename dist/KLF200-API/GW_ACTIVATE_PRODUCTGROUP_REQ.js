"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
class GW_ACTIVATE_PRODUCTGROUP_REQ extends common_1.GW_FRAME_COMMAND_REQ {
    constructor(GroupID, Position, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0, Velocity = 0, PriorityLevelLock = 0, PriorityLevels = [], LockTime = Infinity) {
        super(13);
        this.GroupID = GroupID;
        this.Position = Position;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.ParameterActive = ParameterActive;
        this.Velocity = Velocity;
        this.PriorityLevelLock = PriorityLevelLock;
        this.PriorityLevels = PriorityLevels;
        this.LockTime = LockTime;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.GroupID, 4);
        buff.writeUInt8(this.ParameterActive, 5);
        buff.writeUInt16BE(this.Position, 6);
        buff.writeUInt8(this.Velocity, 8);
        buff.writeUInt8(this.PriorityLevelLock, 9);
        if (this.PriorityLevels.length > 8)
            throw new Error("Too many priority levels.");
        let PLI = 0;
        for (let pliIndex = 0; pliIndex < this.PriorityLevels.length; pliIndex++) {
            const pli = this.PriorityLevels[pliIndex];
            if (pli < 0 || pli > 3)
                throw new Error("Priority level lock out of range.");
            PLI <<= 2;
            PLI |= pli;
        }
        PLI <<= 2 * (8 - this.PriorityLevels.length); // Shift remaining, if provided priority leves are less than 8
        buff.writeUInt16BE(PLI, 10);
        buff.writeUInt8(GW_COMMAND_1.LockTime.lockTimeTolockTimeValue(this.LockTime), 12);
    }
}
exports.GW_ACTIVATE_PRODUCTGROUP_REQ = GW_ACTIVATE_PRODUCTGROUP_REQ;
//# sourceMappingURL=GW_ACTIVATE_PRODUCTGROUP_REQ.js.map