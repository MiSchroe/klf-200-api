"use strict";

import { GW_FRAME_REQ } from "./common.js";

export class GW_GET_SCENE_INFORMATION_REQ extends GW_FRAME_REQ {
	constructor(readonly SceneID: number) {
		super(1);

		const buff = this.Data.subarray(this.offset);
		buff.writeUInt8(this.SceneID, 0);
	}
}
