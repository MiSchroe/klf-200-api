"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_CS_GET_SYSTEMTABLE_DATA_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_CS_GET_SYSTEMTABLE_DATA_REQ;
	constructor() {
		super(0);
	}
}
