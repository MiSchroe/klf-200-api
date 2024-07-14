"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";
import { NodeVariation } from "./GW_SYSTEMTABLE_DATA.js";

export class GW_SET_NODE_VARIATION_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_SET_NODE_VARIATION_REQ;
	constructor(
		readonly NodeID: number,
		readonly NodeVariation: NodeVariation = 0,
	) {
		super(2);

		const buff = this.Data.subarray(this.offset); // View on the internal buffer makes setting the data easier
		buff.writeUInt8(this.NodeID, 0);
		buff.writeUInt8(this.NodeVariation, 1);
	}
}
