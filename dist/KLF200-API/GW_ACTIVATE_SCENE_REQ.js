'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_COMMAND_1 = require("./GW_COMMAND");
class GW_ACTIVATE_SCENE_REQ extends common_1.GW_FRAME_REQ {
    constructor(SceneID, PriorityLevel = 3, CommandOriginator = 1, Velocity = 0) {
        super();
        this.SceneID = SceneID;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.Velocity = Velocity;
        this.SessionID = GW_COMMAND_1.getNextSessionID();
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.SceneID, 4);
        buff.writeUInt8(this.Velocity, 5);
    }
    InitializeBuffer() {
        this.AllocBuffer(6);
    }
}
exports.GW_ACTIVATE_SCENE_REQ = GW_ACTIVATE_SCENE_REQ;
//# sourceMappingURL=GW_ACTIVATE_SCENE_REQ.js.map