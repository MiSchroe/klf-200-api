'use strict';

import { GW_FRAME_NTF } from "./common";
import { ControllerCopyMode } from "./GW_SYSTEMTABLE_DATA";

export class GW_CS_CONTROLLER_COPY_NTF extends GW_FRAME_NTF {
    public readonly ControllerCopyMode: ControllerCopyMode;
    public readonly ControllerCopyStatus: number;

    constructor(Data: Buffer) {
        super(Data);

        this.ControllerCopyMode = this.Data.readUInt8(0);
        this.ControllerCopyStatus = this.Data.readUInt8(1);
    }
}
