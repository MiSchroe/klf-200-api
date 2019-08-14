"use strict";

import { GW_FRAME_NTF, readZString } from "./common";

export class GW_PASSWORD_CHANGE_NTF extends GW_FRAME_NTF {
    public readonly NewPassword: string;

    constructor(Data: Buffer) {
        super(Data);

        this.NewPassword = readZString(this.Data);
    }
}
