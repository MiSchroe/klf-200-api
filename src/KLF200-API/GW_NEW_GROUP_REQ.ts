"use strict";

import { arrayToBitArray } from "../utils/BitArray.js";
import { GroupType } from "./GW_GROUPS.js";
import { NodeVariation, Velocity } from "./GW_SYSTEMTABLE_DATA.js";
import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_NEW_GROUP_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_NEW_GROUP_REQ;
	constructor(
		readonly Name: string,
		readonly GroupType: GroupType,
		readonly Nodes: number[],
		readonly Order: number = 0,
		readonly Placement: number = 0,
		readonly Velocity: Velocity = 0,
		readonly NodeVariation: NodeVariation = 0,
	) {
		super(96);

		const buff = this.Data.subarray(this.offset); // View on the internal buffer makes setting the data easier
		buff.writeUInt16BE(this.Order, 0);
		buff.writeUInt8(this.Placement, 2);
		buff.write(this.Name, 3, 64, "utf8");
		buff.writeUInt8(this.Velocity, 67);
		buff.writeUInt8(this.NodeVariation, 68);
		buff.writeUInt8(this.GroupType, 69);
		buff.writeUInt8(this.Nodes.length, 70);
		arrayToBitArray(this.Nodes, 25, buff.subarray(71, 96));
	}
}
