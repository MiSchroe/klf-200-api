'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
class GW_STOP_SCENE_REQ extends common_1.GW_FRAME_REQ {
    constructor(SceneID, PriorityLevel = 3, CommandOriginator = 1) {
        super();
        this.SceneID = SceneID;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.SessionID = GW_COMMAND_1.getNextSessionID();
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.SceneID, 4);
    }
    InitializeBuffer() {
        this.AllocBuffer(5);
    }
}
exports.GW_STOP_SCENE_REQ = GW_STOP_SCENE_REQ;
//# sourceMappingURL=GW_STOP_SCENE_REQ.js.map