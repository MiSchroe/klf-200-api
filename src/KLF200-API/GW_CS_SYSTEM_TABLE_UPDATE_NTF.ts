"use strict";

import { bitArrayToArray } from "../utils/BitArray.js";
import { GW_FRAME_NTF } from "./common.js";

export class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends GW_FRAME_NTF {
	public readonly AddedNodes: number[];
	public readonly RemovedNodes: number[];

	public constructor(Data: Buffer) {
		super(Data);

		// Added nodes
		this.AddedNodes = bitArrayToArray(this.Data.subarray(0, 26));

		// Removed nodes
		this.RemovedNodes = bitArrayToArray(this.Data.subarray(26, 52));
	}
}
