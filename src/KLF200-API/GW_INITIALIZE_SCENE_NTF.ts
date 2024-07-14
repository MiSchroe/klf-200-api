"use strict";

import { bitArrayToArray } from "../utils/BitArray.js";
import { InitializeSceneNotificationStatus } from "./GW_SCENES.js";
import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_INITIALIZE_SCENE_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_INITIALIZE_SCENE_NTF;
	public readonly Status: InitializeSceneNotificationStatus;
	public readonly FailedNodes: number[];

	constructor(Data: Buffer) {
		super(Data);

		this.Status = this.Data.readUInt8(0);
		this.FailedNodes = bitArrayToArray(this.Data.subarray(1, 26));
	}
}
