'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_GET_NODE_INFORMATION_REQ extends GW_FRAME_REQ {
    constructor(readonly NodeID: number) {
        super(1);

        this.Data.writeUInt8(this.NodeID, this.offset);
    }
}