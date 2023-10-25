"use strict";

import { C_MAX_PWD_LENGTH, GW_FRAME_REQ } from "./common";

export class GW_PASSWORD_CHANGE_REQ extends GW_FRAME_REQ {
	constructor(
		readonly OldPassword: string,
		readonly NewPassword: string,
	) {
		super(C_MAX_PWD_LENGTH * 2);

		if (Buffer.from(this.OldPassword, "utf8").byteLength > C_MAX_PWD_LENGTH)
			throw new Error(`Old password must not exceed ${C_MAX_PWD_LENGTH} characters length.`);

		if (Buffer.from(this.NewPassword, "utf8").byteLength > C_MAX_PWD_LENGTH)
			throw new Error(`New password must not exceed ${C_MAX_PWD_LENGTH} characters length.`);

		const buff = this.Data.subarray(this.offset);
		buff.write(this.OldPassword, 0);
		buff.write(this.NewPassword, C_MAX_PWD_LENGTH);
	}
}
