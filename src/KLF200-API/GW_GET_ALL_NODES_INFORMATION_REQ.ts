"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_GET_ALL_NODES_INFORMATION_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ;
	constructor() {
		super(0);
	}
}
