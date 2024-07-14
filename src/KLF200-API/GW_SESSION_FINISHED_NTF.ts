"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_SESSION_FINISHED_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_SESSION_FINISHED_NTF;
	public readonly SessionID: number;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
	}
}
