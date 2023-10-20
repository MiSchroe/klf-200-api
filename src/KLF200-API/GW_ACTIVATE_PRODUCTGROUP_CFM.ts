"use strict";

import { GW_FRAME_CFM } from "./common";
import { ActivateProductGroupStatus } from "./GW_COMMAND";

export class GW_ACTIVATE_PRODUCTGROUP_CFM extends GW_FRAME_CFM {
	public readonly SessionID: number;
	public readonly Status: ActivateProductGroupStatus;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.Status = this.Data.readUInt8(2);
	}

	public getError(): string {
		switch (this.Status) {
			case ActivateProductGroupStatus.OK:
				return "No error.";

			case ActivateProductGroupStatus.UnknownProductGroup:
				return "Unknown product group.";

			case ActivateProductGroupStatus.SessionIDInUse:
				return "Session ID in use.";

			case ActivateProductGroupStatus.Busy:
				return "Busy.";

			case ActivateProductGroupStatus.WrongGroupType:
				return "Wrong group type.";

			case ActivateProductGroupStatus.Failed:
				return "Failed.";

			case ActivateProductGroupStatus.InvalidParameterUsed:
				return "Invalid parameter.";

			default:
				return `Unknown error ${this.Status}.`;
		}
	}
}
