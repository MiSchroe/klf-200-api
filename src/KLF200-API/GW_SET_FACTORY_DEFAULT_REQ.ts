"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_SET_FACTORY_DEFAULT_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ;
	constructor() {
		super(0);
	}
}
