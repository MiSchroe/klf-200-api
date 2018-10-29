'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_HOUSE_STATUS_MONITOR_DISABLE_REQ extends GW_FRAME_REQ {
    protected InitializeBuffer() {
        this.AllocBuffer(0);
    }
}