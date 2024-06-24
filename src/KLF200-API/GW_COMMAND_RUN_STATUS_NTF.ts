"use strict";

import { GW_FRAME_NTF } from "./common.js";
import { ParameterActive, RunStatus, StatusOwner, StatusReply } from "./GW_COMMAND.js";

export class GW_COMMAND_RUN_STATUS_NTF extends GW_FRAME_NTF {
	public readonly SessionID: number;
	public readonly StatusOwner: StatusOwner;
	public readonly NodeID: number;
	public readonly NodeParameter: ParameterActive;
	public readonly ParameterValue: number;
	public readonly RunStatus: RunStatus;
	public readonly StatusReply: StatusReply;
	public readonly InformationCode: number;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.StatusOwner = this.Data.readUInt8(2);
		this.NodeID = this.Data.readUInt8(3);
		this.NodeParameter = this.Data.readUInt8(4);
		this.ParameterValue = this.Data.readUInt16BE(5);
		this.RunStatus = this.Data.readUInt8(7);
		this.StatusReply = this.Data.readUInt8(8);
		this.InformationCode = this.Data.readUInt32BE(9);
	}
}
