"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";
import { CommandOriginator, ParameterActive } from "./GW_COMMAND.js";

export class GW_LIMITATION_STATUS_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_LIMITATION_STATUS_NTF;
	public readonly SessionID: number;
	public readonly NodeID: number;
	public readonly ParameterID: ParameterActive;
	public readonly LimitationValueMin: number;
	public readonly LimitationValueMax: number;
	public readonly LimitationOriginator: CommandOriginator;
	public readonly LimitationTime: number;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.NodeID = this.Data.readUInt8(2);
		this.ParameterID = this.Data.readUInt8(3);
		this.LimitationValueMin = this.Data.readUInt16BE(4);
		this.LimitationValueMax = this.Data.readUInt16BE(6);
		this.LimitationOriginator = this.Data.readUInt8(8);
		this.LimitationTime = this.Data.readUInt8(9);
	}
}
