"use strict";

import { GW_FRAME_CFM } from "./common.js";

export class GW_GET_SCENE_LIST_CFM extends GW_FRAME_CFM {
	public readonly NumberOfScenes: number;

	constructor(Data: Buffer) {
		super(Data);

		this.NumberOfScenes = this.Data.readUInt8(0);
	}
}
