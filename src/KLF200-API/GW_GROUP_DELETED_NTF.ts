"use strict";

import { GW_FRAME_NTF } from "./common";

export class GW_GROUP_DELETED_NTF extends GW_FRAME_NTF {
	public readonly GroupID: number;

	constructor(Data: Buffer) {
		super(Data);

		this.GroupID = this.Data.readUInt8(0);
	}
}
