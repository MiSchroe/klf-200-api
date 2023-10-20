"use strict";

import { GW_FRAME_NTF, readZString } from "./common";
import { GroupType } from "./GW_GROUPS";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
import { bitArrayToArray } from "../utils/BitArray";

export enum ChangeType {
	Deleted = 0,
	Modified = 1,
}

export interface GW_GROUP_INFORMATION_CHANGED_NTF_Deleted {
	readonly ChangeType: ChangeType.Deleted;
	readonly GroupID: number;
}

export interface GW_GROUP_INFORMATION_CHANGED_NTF_Modified {
	readonly ChangeType: ChangeType.Modified;
	readonly GroupID: number;
	readonly Order: number;
	readonly Placement: number;
	readonly Name: string;
	readonly Velocity: Velocity;
	readonly NodeVariation: NodeVariation;
	readonly GroupType: GroupType;
	readonly Nodes: number[];
	readonly Revision: number;
}

export class GW_GROUP_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
	public readonly GroupID: number;
	public readonly ChangeType: ChangeType;
	public readonly Order?: number;
	public readonly Placement?: number;
	public readonly Name?: string;
	public readonly Velocity?: Velocity;
	public readonly NodeVariation?: NodeVariation;
	public readonly GroupType?: GroupType;
	public readonly Nodes?: number[];
	public readonly Revision?: number;

	constructor(Data: Buffer) {
		super(Data);

		this.ChangeType = this.Data.readUInt8(0);
		this.GroupID = this.Data.readUInt8(1);

		if (this.ChangeType === ChangeType.Modified) {
			this.Order = this.Data.readUInt16BE(2);
			this.Placement = this.Data.readUInt8(4);
			this.Name = readZString(this.Data.slice(5, 69));
			this.Velocity = this.Data.readUInt8(69);
			this.NodeVariation = this.Data.readUInt8(70);
			this.GroupType = this.Data.readUInt8(71);
			this.Revision = this.Data.readUInt16BE(98);

			if (this.GroupType === GroupType.UserGroup) {
				this.Nodes = bitArrayToArray(this.Data.slice(73, 98));
			} else {
				this.Nodes = [];
			}
		}
	}
}
