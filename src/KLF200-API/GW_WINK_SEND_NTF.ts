'use strict';

import { GW_FRAME_NTF } from "./common";

export class GW_WINK_SEND_NTF extends GW_FRAME_NTF {
    public readonly SessionID: number;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
    }
}
