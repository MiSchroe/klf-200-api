"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_REBOOT_REQ extends GW_FRAME_REQ {
    constructor() {
        super(0);
    }
}