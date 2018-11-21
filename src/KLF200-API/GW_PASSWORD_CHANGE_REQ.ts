'use strict';

import { GW_FRAME_REQ, C_MAX_PWD_LENGTH } from "./common";

export class GW_PASSWORD_CHANGE_REQ extends GW_FRAME_REQ {
    constructor(readonly OldPassword: string, readonly NewPassword: string) {
        super(C_MAX_PWD_LENGTH * 2);

        if (Buffer.from(this.OldPassword, "utf8").byteLength > C_MAX_PWD_LENGTH)
            throw `Old password must not exceed ${C_MAX_PWD_LENGTH} characters length.`;

        if (Buffer.from(this.NewPassword, "utf8").byteLength > C_MAX_PWD_LENGTH)
            throw `New password must not exceed ${C_MAX_PWD_LENGTH} characters length.`;
        
        this.Data.write(this.OldPassword, 0);
        this.Data.write(this.NewPassword, 31);
    }
}