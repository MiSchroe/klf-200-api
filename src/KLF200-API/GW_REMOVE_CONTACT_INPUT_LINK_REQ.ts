"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_REMOVE_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_REMOVE_CONTACT_INPUT_LINK_REQ;
	constructor(readonly ContactInputID: number) {
		super(1);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt8(this.ContactInputID, 0);
	}
}
