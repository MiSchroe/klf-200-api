"use strict";

import { bitArrayToArray } from "../utils/BitArray.js";
import { ChangeKeyStatus } from "./GW_SYSTEMTABLE_DATA.js";
import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_CS_REPAIR_KEY_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_CS_REPAIR_KEY_NTF;
	public readonly ChangeKeyStatus: ChangeKeyStatus;
	public readonly KeyChangedNodes: number[];
	public readonly KeyNotChangedNodes: number[];

	constructor(Data: Buffer) {
		super(Data);

		this.ChangeKeyStatus = this.Data.readUInt8(0);
		this.KeyChangedNodes = bitArrayToArray(this.Data.subarray(1, 27));
		this.KeyNotChangedNodes = bitArrayToArray(this.Data.subarray(27, 53));
	}
}
