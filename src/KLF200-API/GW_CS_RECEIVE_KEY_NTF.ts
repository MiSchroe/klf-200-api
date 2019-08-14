"use strict";

import { GW_FRAME_NTF } from "./common";
import { ChangeKeyStatus } from "./GW_SYSTEMTABLE_DATA";
import { bitArrayToArray } from "../utils/BitArray";

export class GW_CS_RECEIVE_KEY_NTF extends GW_FRAME_NTF {
    public readonly ChangeKeyStatus: ChangeKeyStatus;
    public readonly KeyChangedNodes: number[];
    public readonly KeyNotChangedNodes: number[];

    constructor(Data: Buffer) {
        super(Data);

        this.ChangeKeyStatus = this.Data.readUInt8(0);
        this.KeyChangedNodes = bitArrayToArray(this.Data.slice(1, 27));
        this.KeyNotChangedNodes = bitArrayToArray(this.Data.slice(27, 53));
    }
}
