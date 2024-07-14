"use strict";

import { C_MAX_PWD_LENGTH, GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_PASSWORD_ENTER_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_PASSWORD_ENTER_REQ;
	constructor(password: string) {
		super(C_MAX_PWD_LENGTH);

		this.Password = password;
	}

	set Password(newPassword: string) {
		const buffer = Buffer.from(newPassword, "utf8");

		if (buffer.byteLength > C_MAX_PWD_LENGTH) throw new Error("Password must not exceed 32 characters length.");

		this.Data.fill(0, this.offset);
		buffer.copy(this.Data, this.offset);
	}
}
