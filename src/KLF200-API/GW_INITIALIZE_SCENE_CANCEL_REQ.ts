"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_INITIALIZE_SCENE_CANCEL_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_INITIALIZE_SCENE_CANCEL_REQ;
	constructor() {
		super(0);
	}
}
