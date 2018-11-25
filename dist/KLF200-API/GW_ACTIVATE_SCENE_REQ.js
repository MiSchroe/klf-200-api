'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_ACTIVATE_SCENE_REQ extends common_1.GW_FRAME_COMMAND_REQ {
    constructor(SceneID, PriorityLevel = 3, CommandOriginator = 1, Velocity = 0) {
        super(6);
        this.SceneID = SceneID;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.Velocity = Velocity;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.SceneID, 4);
        buff.writeUInt8(this.Velocity, 5);
    }
}
exports.GW_ACTIVATE_SCENE_REQ = GW_ACTIVATE_SCENE_REQ;
