"use strict";

import { GW_FRAME_REQ } from "./common.js";

export class GW_REMOVE_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
	constructor(readonly ContactInputID: number) {
		super(1);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt8(this.ContactInputID, 0);
	}
}
