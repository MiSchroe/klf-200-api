'use strict';

import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";

export class GW_LEAVE_LEARN_STATE_CFM extends GW_FRAME_CFM {
    public readonly Status: GW_INVERSE_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
    }
}
