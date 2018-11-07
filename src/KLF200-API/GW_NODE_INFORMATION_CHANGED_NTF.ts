'use strict';

import { GW_FRAME_NTF, readZString } from "./common";
import { NodeVariation } from "./GW_SYSTEMTABLE_DATA";

export class GW_NODE_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    public readonly NodeID: number;
    public readonly Order: number;
    public readonly Placement: number;
    public readonly Name: string;
    public readonly NodeVariation: NodeVariation;

    constructor(Data: Buffer) {
        super(Data);

        this.NodeID = this.Data.readUInt8(0);
        this.Name = readZString(this.Data.slice(1, 65));
        this.Order = this.Data.readUInt16BE(65);
        this.Placement = this.Data.readUInt8(67);
        this.NodeVariation = this.Data.readUInt8(68);
    }
}
