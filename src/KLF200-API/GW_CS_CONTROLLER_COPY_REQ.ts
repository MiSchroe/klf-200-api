"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";
import { ControllerCopyMode } from "./GW_SYSTEMTABLE_DATA.js";

export class GW_CS_CONTROLLER_COPY_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_CS_CONTROLLER_COPY_REQ;
	constructor(readonly ControllerCopyMode: ControllerCopyMode) {
		super(1);

		const buff = this.Data.subarray(this.offset); // View on the internal buffer makes setting the data easier
		buff.writeUInt8(this.ControllerCopyMode, 0);
	}
}
