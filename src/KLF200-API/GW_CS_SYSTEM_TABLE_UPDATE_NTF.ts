'use strict';

import { GW_FRAME_NTF } from "./common";
import { bitArrayToArray } from "../utils/BitArray";

export class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends GW_FRAME_NTF {
    public readonly AddedNodes: number[];
    public readonly RemovedNodes: number[];

    public constructor(Data: Buffer) {
        super(Data);

        // Added nodes
        this.AddedNodes = bitArrayToArray(this.Data.slice(0, 26));

        // Removed nodes
        this.RemovedNodes = bitArrayToArray(this.Data.slice(26, 52));
    }
}
