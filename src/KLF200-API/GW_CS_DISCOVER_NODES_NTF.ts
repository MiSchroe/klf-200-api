'use strict';

import { GW_FRAME_NTF } from "./common";
import { bitArrayToArray } from "../utils/BitArray";

export enum DiscoverStatus {
    OK = 0,
    Failed = 5,
    PartialOK = 6,
    Busy = 7
}

export class GW_CS_DISCOVER_NODES_NTF extends GW_FRAME_NTF {
    public readonly AddedNodes: number[];
    public readonly RFConnectionErrorNodes: number[];
    public readonly ioKeyErrorExistingNodes: number[];
    public readonly RemovedNodes: number[];
    public readonly OpenNodes: number[];
    public readonly DiscoverStatus: DiscoverStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.AddedNodes = bitArrayToArray(this.Data.slice(0, 26));
        this.RFConnectionErrorNodes = bitArrayToArray(this.Data.slice(26, 52));
        this.ioKeyErrorExistingNodes = bitArrayToArray(this.Data.slice(52, 78));
        this.RemovedNodes = bitArrayToArray(this.Data.slice(78, 104));
        this.OpenNodes = bitArrayToArray(this.Data.slice(104, 130));
        this.DiscoverStatus = this.Data.readUInt8(130);
    }
}
