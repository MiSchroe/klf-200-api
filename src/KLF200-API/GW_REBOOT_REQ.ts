"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_REBOOT_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_REBOOT_REQ;
	constructor() {
		super(0);
	}
}
