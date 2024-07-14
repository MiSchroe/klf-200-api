"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";
import { ActivateSceneStatus } from "./GW_SCENES.js";

export class GW_STOP_SCENE_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_STOP_SCENE_CFM;
	public readonly SessionID: number;
	public readonly Status: ActivateSceneStatus;

	constructor(Data: Buffer) {
		super(Data);

		this.Status = this.Data.readUInt8(0);
		this.SessionID = this.Data.readUInt16BE(1);
	}

	public getError(): string {
		switch (this.Status) {
			case ActivateSceneStatus.OK:
				throw new Error("No error.");

			case ActivateSceneStatus.RequestRejected:
				return "Request failed.";

			case ActivateSceneStatus.InvalidParameter:
				return "Invalid parameter.";

			default:
				return `Unknown error ${this.Status as number}.`;
		}
	}
}
