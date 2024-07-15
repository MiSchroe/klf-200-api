"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_GET_ACTIVATION_LOG_HEADER_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_GET_ACTIVATION_LOG_HEADER_REQ;
	constructor() {
		super(0);
	}
}
