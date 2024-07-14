"use strict";

import { GatewayCommand, GW_FRAME_NTF, readZString } from "./common.js";

export class GW_PASSWORD_CHANGE_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_PASSWORD_CHANGE_NTF;
	public readonly NewPassword: string;

	constructor(Data: Buffer) {
		super(Data);

		this.NewPassword = readZString(this.Data);
	}
}
