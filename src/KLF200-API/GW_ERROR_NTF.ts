'use strict';

import { GW_FRAME_NTF } from "./common";

export enum GW_ERROR {
    NotFurtherDefined           = 0,
    UnknownCommand              = 1,
    InvalidFrameStructure       = 2,
    Busy                        = 7,
    InvalidSystemTableIndex     = 8,
    NotAuthenticated            = 12,
    UnknonwErrorCode            = 255
}

export class GW_ERROR_NTF extends GW_FRAME_NTF {
    public readonly ErrorNumber: GW_ERROR;

    constructor(Data: Buffer) {
        super(Data);

        const errorNumber = this.Data.readUInt8(0);
        if (errorNumber in GW_ERROR)
            this.ErrorNumber = <GW_ERROR>errorNumber
        else
            this.ErrorNumber = GW_ERROR.UnknonwErrorCode;
    }
}
