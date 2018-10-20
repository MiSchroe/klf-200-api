'use strict';

import { GW_FRAME, GW_FRAME_NTF, GatewayCommand, GatewayCommand_Notification } from "./common";

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
    readonly Command = GatewayCommand.GW_ERROR_NTF;

    get ErrorNumber(): GW_ERROR {
        const errorNumber = this.Data.readUInt8(this.offset + 0);
        if (errorNumber in GW_ERROR)
            return <GW_ERROR>errorNumber
        else
            return GW_ERROR.UnknonwErrorCode;
    }
}
