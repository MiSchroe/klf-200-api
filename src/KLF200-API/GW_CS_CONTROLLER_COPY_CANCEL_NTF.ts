"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_CS_CONTROLLER_COPY_CANCEL_NTF extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_CS_CONTROLLER_COPY_CANCEL_NTF;
	constructor() {
		super(0);
	}
}
