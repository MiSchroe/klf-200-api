"use strict";

import { GW_FRAME_REQ } from "./common";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
import { GroupType } from "./GW_GROUPS";
import { arrayToBitArray } from "../utils/BitArray";

export class GW_SET_GROUP_INFORMATION_REQ extends GW_FRAME_REQ {
    constructor(readonly GroupID: number, readonly Revision: number, readonly Name: string, readonly GroupType: GroupType, readonly Nodes: number[], readonly Order: number = 0, readonly Placement: number = 0, readonly Velocity: Velocity = 0, readonly NodeVariation: NodeVariation = 0) {
        super(99);

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.GroupID, 0);
        buff.writeUInt16BE(this.Order, 1);
        buff.writeUInt8(this.Placement, 3);
        buff.write(this.Name, 4, 64, "utf8");
        buff.writeUInt8(this.Velocity, 68);
        buff.writeUInt8(this.NodeVariation, 69);
        buff.writeUInt8(this.GroupType, 70);
        buff.writeUInt8(this.Nodes.length, 71);
        arrayToBitArray(this.Nodes, 25, buff.slice(72, 97));
        buff.writeUInt16BE(this.Revision, 97);
    }
}