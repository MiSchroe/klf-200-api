'use strict';

import { GW_FRAME_CFM } from "./common";
import { ActivateProductGroupStatus } from "./GW_COMMAND";

export class GW_ACTIVATE_PRODUCTGROUP_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly Status: ActivateProductGroupStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
}
