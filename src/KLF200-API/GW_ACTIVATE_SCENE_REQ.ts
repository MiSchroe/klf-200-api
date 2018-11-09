'use strict';

import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, getNextSessionID } from "./GW_COMMAND";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";

export class GW_ACTIVATE_SCENE_REQ extends GW_FRAME_REQ {
    public readonly SessionID: number;

    constructor(readonly SceneID: number, readonly PriorityLevel: PriorityLevel = 3, readonly CommandOriginator: CommandOriginator = 1, readonly Velocity: Velocity = 0) {
        super();

        this.SessionID = getNextSessionID();
        const buff = this.Data.slice(this.offset);

        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.SceneID, 4);
        buff.writeUInt8(this.Velocity, 5);
    }

    protected InitializeBuffer() {
        this.AllocBuffer(6);
    }
}