"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_GET_GROUP_INFORMATION_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_GET_GROUP_INFORMATION_REQ;
	constructor(readonly GroupID: number) {
		super(1);

		this.Data.writeUInt8(this.GroupID, this.offset);
	}
}
