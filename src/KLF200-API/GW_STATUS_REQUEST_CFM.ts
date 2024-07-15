"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";
import { CommandStatus } from "./GW_COMMAND.js";

export class GW_STATUS_REQUEST_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_STATUS_REQUEST_CFM;
	public readonly SessionID: number;
	public readonly CommandStatus: CommandStatus;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.CommandStatus = this.Data.readUInt8(2);
	}

	public getError(): string {
		switch (this.CommandStatus) {
			case CommandStatus.CommandAccepted:
				throw new Error("No error.");

			case CommandStatus.CommandRejected:
				return "Command rejected.";

			default:
				return `Unknown error ${this.CommandStatus as number}.`;
		}
	}
}
