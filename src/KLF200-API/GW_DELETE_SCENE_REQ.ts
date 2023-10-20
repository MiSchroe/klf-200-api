"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_DELETE_SCENE_REQ extends GW_FRAME_REQ {
	constructor(readonly SceneID: number) {
		super(1);

		const buff = this.Data.slice(this.offset);
		buff.writeUInt8(this.SceneID, 0);
	}
}
