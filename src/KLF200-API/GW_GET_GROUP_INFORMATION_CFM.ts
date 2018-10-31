'use strict';

import { GW_FRAME_NTF, readZString } from "./common";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
import { GroupType } from "./GW_GROUPS";
import { bitArrayToArray } from "../utils/BitArray";

export class GW_GET_GROUP_INFORMATION_CFM extends GW_FRAME_NTF {
    public readonly GroupID: number;
    public readonly Order: number;
    public readonly Placement: number;
    public readonly Name: string;
    public readonly Velocity: Velocity;
    public readonly GroupType: GroupType;
    public readonly NodeVariation: NodeVariation;
    public readonly Revision: number;
    public readonly Nodes: number[];

    constructor(Data: Buffer) {
        super(Data);

        this.GroupID = this.Data.readUInt8(0);
        this.Order = this.Data.readUInt16BE(1);
        this.Placement = this.Data.readUInt8(3);
        this.Name = readZString(this.Data.slice(4, 68));
        this.Velocity = this.Data.readUInt8(68);
        this.NodeVariation = this.Data.readUInt8(69);
        this.GroupType = this.Data.readUInt8(70);
        this.Revision = this.Data.readUInt16BE(97);

        if (this.GroupType === GroupType.UserGroup) {
            this.Nodes = bitArrayToArray(this.Data.slice(72, 97));
        }
        else
        {
            this.Nodes = [];
        }
    }
}
