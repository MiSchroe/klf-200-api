'use strict';

import { GW_FRAME_REQ } from "./common";
import { NodeVariation } from "./GW_SYSTEMTABLE_DATA";

export class GW_SET_NODE_VARIATION_REQ extends GW_FRAME_REQ {
    constructor(readonly NodeID: number, readonly NodeVariation: NodeVariation = 0) {
        super();

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.writeUInt8(this.NodeVariation, 1);
    }

    protected InitializeBuffer() {
        this.AllocBuffer(2);
    }
}