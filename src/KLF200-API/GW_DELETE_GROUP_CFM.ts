'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";

export class GW_DELETE_GROUP_CFM extends GW_FRAME_CFM {
    public readonly GroupID: number;
    public readonly Status: GW_COMMON_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.GroupID = this.Data.readUInt8(1);
    }
}
