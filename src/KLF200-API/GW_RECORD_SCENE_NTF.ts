"use strict";

import { GW_FRAME_NTF } from "./common.js";
import { RecordSceneStatus } from "./GW_SCENES.js";

export class GW_RECORD_SCENE_NTF extends GW_FRAME_NTF {
	public readonly Status: RecordSceneStatus;
	public readonly SceneID: number;

	constructor(Data: Buffer) {
		super(Data);

		this.Status = this.Data.readUInt8(0);
		this.SceneID = this.Data.readUInt8(1);
	}
}
