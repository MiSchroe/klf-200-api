'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
const util_1 = require("util");
class GW_COMMAND_SEND_REQ extends common_1.GW_FRAME_REQ {
    constructor(Nodes, MainValue, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0, FunctionalParameters = [], PriorityLevelLock = 0, PriorityLevels = [], LockTime = Infinity) {
        super();
        this.Nodes = Nodes;
        this.MainValue = MainValue;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.ParameterActive = ParameterActive;
        this.FunctionalParameters = FunctionalParameters;
        this.PriorityLevelLock = PriorityLevelLock;
        this.PriorityLevels = PriorityLevels;
        this.LockTime = LockTime;
        this.SessionID = GW_COMMAND_1.getNextSessionID();
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.ParameterActive, 4);
        let FPI1 = 0;
        let FPI2 = 0;
        for (let functionalParameterIndex = 0; functionalParameterIndex < this.FunctionalParameters.length; functionalParameterIndex++) {
            const functionalParameter = this.FunctionalParameters[functionalParameterIndex];
            const functionalParameterID = functionalParameter.ID - 1;
            if (functionalParameterID < 0 || functionalParameterID > 15)
                throw "Functional paramter ID out of range.";
            if (functionalParameterID < 8) {
                FPI1 |= 0x80 >>> functionalParameterID;
            }
            else {
                FPI2 |= 0x80 >>> (functionalParameterID - 8);
            }
            buff.writeUInt16BE(functionalParameter.Value, 9 + 2 * functionalParameterID);
        }
        buff.writeUInt16BE(this.MainValue, 7);
        // Multiple nodes are provided
        if (util_1.isArray(this.Nodes)) {
            if (this.Nodes.length > 20)
                throw "Too many nodes.";
            buff.writeUInt8(this.Nodes.length, 41);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 42 + nodeIndex);
            }
        }
        else {
            buff.writeUInt8(1, 41);
            buff.writeUInt8(this.Nodes, 42);
        }
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
        buff.writeUInt16BE(PLI, 63);
        buff.writeUInt8(GW_COMMAND_1.LockTime.lockTimeTolockTimeValue(this.LockTime), 65);
    }
    InitializeBuffer() {
        this.AllocBuffer(66);
    }
}
exports.GW_COMMAND_SEND_REQ = GW_COMMAND_SEND_REQ;
//# sourceMappingURL=GW_COMMAND_SEND_REQ.js.map