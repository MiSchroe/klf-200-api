'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";

export class GW_PASSWORD_ENTER_CFM extends GW_FRAME_CFM {
    get Status(): GW_COMMON_STATUS {
        const status = this.Data.readUInt8(0);
        return <GW_COMMON_STATUS>status;
    }
}
