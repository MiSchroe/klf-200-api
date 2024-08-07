"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_GET_PROTOCOL_VERSION_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_GET_PROTOCOL_VERSION_CFM;
	public readonly MajorVersion: number;
	public readonly MinorVersion: number;

	constructor(Data: Buffer) {
		super(Data);

		this.MajorVersion = this.Data.readUInt16BE(0);
		this.MinorVersion = this.Data.readUInt16BE(2);
	}
}
