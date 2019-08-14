"use strict";

import { GW_FRAME_COMMAND_REQ } from "./common";
import { CommandOriginator, PriorityLevel } from "./GW_COMMAND";

export class GW_STOP_SCENE_REQ extends GW_FRAME_COMMAND_REQ {
    constructor(readonly SceneID: number, readonly PriorityLevel: PriorityLevel = 3, readonly CommandOriginator: CommandOriginator = 1) {
        super(5);

        const buff = this.Data.slice(this.offset);

        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.SceneID, 4);
    }
}