"use strict";

import { GW_FRAME_CFM } from "./common";

export class GW_GET_ACTIVATION_LOG_HEADER_CFM extends GW_FRAME_CFM {
    public readonly MaxLineCount: number;
    public readonly LineCount: number;
    
    constructor(Data: Buffer) {
        super(Data);

        this.MaxLineCount = this.Data.readUInt16BE(0);
        this.LineCount = this.Data.readUInt16BE(2);
    }
}
