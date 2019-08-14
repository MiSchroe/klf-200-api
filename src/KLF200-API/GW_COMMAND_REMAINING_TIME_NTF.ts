"use strict";

import { GW_FRAME_NTF } from "./common";
import { ParameterActive } from "./GW_COMMAND";

export class GW_COMMAND_REMAINING_TIME_NTF extends GW_FRAME_NTF {
    public readonly SessionID: number;
    public readonly NodeID: number;
    public readonly NodeParameter: ParameterActive;
    public readonly RemainingTime: number;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.NodeID = this.Data.readUInt8(2);
        this.NodeParameter = this.Data.readUInt8(3);
        this.RemainingTime = this.Data.readUInt16BE(4);
    }
}
