"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_CS_RECEIVE_KEY_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_CS_RECEIVE_KEY_REQ;
	constructor() {
		super(0);
	}
}
