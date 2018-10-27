'use strict';

import { GW_FRAME_REQ, GatewayCommand } from "./common";

const C_MAX_PWD_LENGTH = 32;

export class GW_PASSWORD_ENTER_REQ extends GW_FRAME_REQ {
    readonly Command = GatewayCommand.GW_PASSWORD_CHANGE_REQ;

    constructor(password: string) {
        super();

        this.Password = password;
    }

    set Password(newPassword: string) {
        const buffer = Buffer.from(newPassword, "utf8");

        if (buffer.byteLength > C_MAX_PWD_LENGTH)
            throw new Error("Password must not exceed 32 characters length.");

        this.Data.fill(0, this.offset);
        buffer.copy(this.Data, this.offset);
    }

    protected InitializeBuffer() {
        this.AllocBuffer(C_MAX_PWD_LENGTH);
    }
}