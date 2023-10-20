"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ extends GW_FRAME_REQ {
	constructor(readonly TimeStamp: Date) {
		super(4);

		const buff = this.Data.slice(this.offset);
		buff.writeUInt32BE(this.TimeStamp.valueOf() / 1000, 0);
	}
}
