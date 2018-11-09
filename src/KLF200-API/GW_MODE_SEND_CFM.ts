'use strict';

import { GW_FRAME_CFM } from "./common";
import { ModeStatus } from "./GW_COMMAND";

export class GW_MODE_SEND_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly ModeStatus: ModeStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.ModeStatus = this.Data.readUInt8(2);
    }
}
