"use strict";

import { GW_FRAME_CFM } from "./common.js";

export class GW_GET_NETWORK_SETUP_CFM extends GW_FRAME_CFM {
	public readonly IPAddress: string;
	public readonly Mask: string;
	public readonly DefaultGateway: string;
	public readonly DHCP: boolean;

	constructor(Data: Buffer) {
		super(Data);

		this.IPAddress = `${this.Data.readUInt8(0)}.${this.Data.readUInt8(1)}.${this.Data.readUInt8(
			2,
		)}.${this.Data.readUInt8(3)}`;
		this.Mask = `${this.Data.readUInt8(4)}.${this.Data.readUInt8(5)}.${this.Data.readUInt8(
			6,
		)}.${this.Data.readUInt8(7)}`;
		this.DefaultGateway = `${this.Data.readUInt8(8)}.${this.Data.readUInt8(9)}.${this.Data.readUInt8(
			10,
		)}.${this.Data.readUInt8(11)}`;
		this.DHCP = this.Data.readUInt8(12) === 1;
	}
}
