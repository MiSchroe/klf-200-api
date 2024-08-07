"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_RENAME_SCENE_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_RENAME_SCENE_REQ;
	constructor(
		readonly SceneID: number,
		readonly Name: string,
	) {
		super(65);

		if (Buffer.from(this.Name).byteLength > 64) throw new Error("Name too long.");

		const buff = this.Data.subarray(this.offset);
		buff.writeUInt8(this.SceneID, 0);
		buff.write(this.Name, 1);
	}
}
