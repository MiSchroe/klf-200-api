"use strict";

import { GW_FRAME_REQ } from "./common.js";

export class GW_SET_NETWORK_SETUP_REQ extends GW_FRAME_REQ {
	constructor(
		readonly DHCP: boolean,
		readonly IPAddress: string = "0.0.0.0",
		readonly Mask: string = "0.0.0.0",
		readonly DefaultGateway: string = "0.0.0.0",
	) {
		super(13);

		// Check for valid IP address formats:
		const checkIPv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		if (!checkIPv4.test(this.IPAddress)) throw new Error("Invalid IP address for parameter IPAddress.");
		if (!checkIPv4.test(this.Mask)) throw new Error("Invalid IP address for parameter Mask.");
		if (!checkIPv4.test(this.DefaultGateway)) throw new Error("Invalid IP address for parameter DefaultGateway.");

		const buff = this.Data.subarray(this.offset);
		buff.writeUInt8(DHCP ? 1 : 0, 12);
		if (!DHCP) {
			let buffIndex = 0;
			this.IPAddress.split(".").forEach((addressPart) => {
				buff.writeUInt8(parseInt(addressPart), buffIndex++);
			});
			this.Mask.split(".").forEach((addressPart) => {
				buff.writeUInt8(parseInt(addressPart), buffIndex++);
			});
			this.DefaultGateway.split(".").forEach((addressPart) => {
				buff.writeUInt8(parseInt(addressPart), buffIndex++);
			});
		}
	}
}
