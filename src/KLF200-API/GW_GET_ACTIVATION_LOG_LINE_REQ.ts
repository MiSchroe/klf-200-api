"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_GET_ACTIVATION_LOG_LINE_REQ extends GW_FRAME_REQ {
	constructor(readonly Line: number) {
		super(2);

		const buff = this.Data.subarray(this.offset);
		buff.writeUInt16BE(this.Line, 0);
	}
}
