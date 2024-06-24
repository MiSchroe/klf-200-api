"use strict";

import { GW_FRAME_CFM } from "./common.js";

export class GW_CS_REMOVE_NODES_CFM extends GW_FRAME_CFM {
	public readonly SceneDeleted: boolean;

	constructor(Data: Buffer) {
		super(Data);

		this.SceneDeleted = this.Data.readUInt8(0) === 1;
	}
}
