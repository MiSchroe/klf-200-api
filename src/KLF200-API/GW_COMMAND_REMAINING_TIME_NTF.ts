"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";
import { ParameterActive } from "./GW_COMMAND.js";

export class GW_COMMAND_REMAINING_TIME_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF;
	public readonly SessionID: number;
	public readonly NodeID: number;
	public readonly NodeParameter: ParameterActive;
	public readonly RemainingTime: number;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.NodeID = this.Data.readUInt8(2);
		this.NodeParameter = this.Data.readUInt8(3);
		this.RemainingTime = this.Data.readUInt16BE(4);
	}
}
