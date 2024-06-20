"use strict";

import { GW_FRAME_REQ } from "./common.js";

export class GW_INITIALIZE_SCENE_CANCEL_REQ extends GW_FRAME_REQ {
	constructor() {
		super(0);
	}
}
