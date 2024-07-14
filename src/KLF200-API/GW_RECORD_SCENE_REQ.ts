"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_RECORD_SCENE_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_RECORD_SCENE_REQ;
	constructor(readonly Name: string) {
		super(64);

		if (Buffer.from(Name).byteLength > 64) throw new Error("Name too long.");

		const buff = this.Data.subarray(this.offset);
		buff.write(this.Name, 0);
	}
}
