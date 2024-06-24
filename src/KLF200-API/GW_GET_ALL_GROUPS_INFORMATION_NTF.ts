"use strict";

import { bitArrayToArray } from "../utils/BitArray.js";
import { GroupType } from "./GW_GROUPS.js";
import { NodeVariation, Velocity } from "./GW_SYSTEMTABLE_DATA.js";
import { GW_FRAME_NTF, readZString } from "./common.js";

export class GW_GET_ALL_GROUPS_INFORMATION_NTF extends GW_FRAME_NTF {
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
		this.Name = readZString(this.Data.subarray(4, 68));
		this.Velocity = this.Data.readUInt8(68);
		this.NodeVariation = this.Data.readUInt8(69);
		this.GroupType = this.Data.readUInt8(70);
		this.Revision = this.Data.readUInt16BE(97);

		if ([GroupType.UserGroup, GroupType.All].indexOf(this.GroupType) !== -1) {
			this.Nodes = bitArrayToArray(this.Data.subarray(72, 97));
		} else {
			this.Nodes = [];
		}
	}
}
