"use strict";

import { GatewayCommand, GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common.js";

export class GW_GET_LIMITATION_STATUS_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_GET_LIMITATION_STATUS_CFM;
	public readonly SessionID: number;
	public readonly Status: GW_INVERSE_STATUS;

	constructor(Data: Buffer) {
		super(Data);

		this.SessionID = this.Data.readUInt16BE(0);
		this.Status = this.Data.readUInt8(2);
	}

	public getError(): string {
		switch (this.Status) {
			case GW_INVERSE_STATUS.SUCCESS:
				throw new Error("No error.");

			case GW_INVERSE_STATUS.ERROR:
				return "Request failed.";

			default:
				return `Unknown error ${this.Status as number}.`;
		}
	}
}
