"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_HOUSE_STATUS_MONITOR_ENABLE_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ;
	constructor() {
		super(0);
	}
}
