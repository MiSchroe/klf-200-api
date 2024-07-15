"use strict";

import { GatewayCommand, GW_COMMON_STATUS, GW_FRAME_CFM } from "./common.js";

export class GW_SET_NODE_NAME_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_SET_NODE_NAME_CFM;
	public readonly Status: GW_COMMON_STATUS;
	public readonly NodeID: number;

	constructor(Data: Buffer) {
		super(Data);

		this.Status = this.Data.readUInt8(0);
		this.NodeID = this.Data.readUInt8(1);
	}

	public getError(): string {
		switch (this.Status) {
			case GW_COMMON_STATUS.SUCCESS:
				throw new Error("No error.");

			case GW_COMMON_STATUS.ERROR:
				return "Request failed.";

			case GW_COMMON_STATUS.INVALID_NODE_ID:
				return "Invalid node ID.";

			default:
				return `Unknown error ${this.Status as number}.`;
		}
	}
}
