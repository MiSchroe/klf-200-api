"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_DELETE_GROUP_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_DELETE_GROUP_REQ;
	constructor(readonly GroupID: number) {
		super(1);

		this.Data.writeUInt8(this.GroupID, this.offset);
	}
}
