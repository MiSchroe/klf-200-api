'use strict';

import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";

export class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM extends GW_FRAME_CFM {
    public readonly LineCount: number;
    public readonly Status: GW_INVERSE_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.LineCount = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
}
