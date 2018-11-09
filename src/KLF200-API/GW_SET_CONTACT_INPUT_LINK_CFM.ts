'use strict';

import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";

export class GW_SET_CONTACT_INPUT_LINK_CFM extends GW_FRAME_CFM {
    public readonly ContactInputID: number;
    public readonly Status: GW_INVERSE_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.ContactInputID = this.Data.readUInt8(0);
        this.Status = this.Data.readUInt8(1);
    }
}
