"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_SET_NODE_ORDER_AND_PLACEMENT_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ;
	constructor(
		readonly NodeID: number,
		readonly Order: number,
		readonly Placement: number,
	) {
		super(4);

		const buff = this.Data.subarray(this.offset); // View on the internal buffer makes setting the data easier
		buff.writeUInt8(this.NodeID, 0);
		buff.writeUInt16BE(this.Order, 1);
		buff.writeUInt8(this.Placement, 3);
	}
}
