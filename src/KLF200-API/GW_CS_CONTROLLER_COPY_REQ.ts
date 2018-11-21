'use strict';

import { GW_FRAME_REQ } from "./common";
import { ControllerCopyMode } from "./GW_SYSTEMTABLE_DATA";

export class GW_CS_CONTROLLER_COPY_REQ extends GW_FRAME_REQ {
    constructor(readonly ControllerCopyMode: ControllerCopyMode) {
        super(1);

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.ControllerCopyMode, 0);
    }
}