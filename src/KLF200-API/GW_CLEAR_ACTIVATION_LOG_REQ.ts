"use strict";

import { GW_FRAME_REQ } from "./common.js";

export class GW_CLEAR_ACTIVATION_LOG_REQ extends GW_FRAME_REQ {
	constructor() {
		super(0);
	}
}
