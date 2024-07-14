"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_GROUP_DELETED_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_GROUP_DELETED_NTF;
	public readonly GroupID: number;

	constructor(Data: Buffer) {
		super(Data);

		this.GroupID = this.Data.readUInt8(0);
	}
}
