"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_GET_PROTOCOL_VERSION_REQ extends GW_FRAME_REQ {
    constructor() {
        super(0);
    }
}