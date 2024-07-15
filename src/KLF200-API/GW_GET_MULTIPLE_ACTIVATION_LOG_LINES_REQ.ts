"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ;
	constructor(readonly TimeStamp: Date) {
		super(4);

		const buff = this.Data.subarray(this.offset);
		buff.writeUInt32BE(this.TimeStamp.valueOf() / 1000, 0);
	}
}
