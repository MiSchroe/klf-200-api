'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_CS_CONTROLLER_COPY_CANCEL_NTF extends GW_FRAME_REQ {
    constructor() {
        super(0);
    }
}