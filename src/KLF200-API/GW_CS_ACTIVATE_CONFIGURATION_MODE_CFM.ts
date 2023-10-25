"use strict";

import { bitArrayToArray } from "../utils/BitArray";
import { GW_FRAME_CFM } from "./common";

export class GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM extends GW_FRAME_CFM {
	public readonly ActivatedNodes: number[];
	public readonly NoContactNodes: number[];
	public readonly OtherErrorNodes: number[];
	public readonly Status: number;

	constructor(Data: Buffer) {
		super(Data);

		this.ActivatedNodes = bitArrayToArray(this.Data.subarray(0, 26));
		this.NoContactNodes = bitArrayToArray(this.Data.subarray(26, 52));
		this.OtherErrorNodes = bitArrayToArray(this.Data.subarray(52, 78));
		this.Status = this.Data.readUInt8(78);
	}

	public getError(): string {
		switch (this.Status) {
			case 0:
				throw new Error("No error.");

			default:
				return `Error code ${this.Status.toString()}.`;
		}
	}
}
