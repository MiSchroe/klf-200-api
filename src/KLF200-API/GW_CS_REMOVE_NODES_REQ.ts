"use strict";

import { GW_FRAME_REQ } from "./common";
import { arrayToBitArray } from "../utils/BitArray";

export class GW_CS_REMOVE_NODES_REQ extends GW_FRAME_REQ {
    constructor(readonly Nodes: number[]) {
        super(26);

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        arrayToBitArray(this.Nodes, 26, buff);
    }
}