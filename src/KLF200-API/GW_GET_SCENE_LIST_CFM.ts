"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_GET_SCENE_LIST_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_GET_SCENE_LIST_CFM;
	public readonly NumberOfScenes: number;

	constructor(Data: Buffer) {
		super(Data);

		this.NumberOfScenes = this.Data.readUInt8(0);
	}
}
