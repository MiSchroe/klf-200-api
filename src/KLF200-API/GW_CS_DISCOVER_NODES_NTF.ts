"use strict";

import { bitArrayToArray } from "../utils/BitArray.js";
import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export enum DiscoverStatus {
	OK = 0,
	Failed = 5,
	PartialOK = 6,
	Busy = 7,
}

export class GW_CS_DISCOVER_NODES_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_CS_DISCOVER_NODES_NTF;
	public readonly AddedNodes: number[];
	public readonly RFConnectionErrorNodes: number[];
	public readonly ioKeyErrorExistingNodes: number[];
	public readonly RemovedNodes: number[];
	public readonly OpenNodes: number[];
	public readonly DiscoverStatus: DiscoverStatus;

	constructor(Data: Buffer) {
		super(Data);

		this.AddedNodes = bitArrayToArray(this.Data.subarray(0, 26));
		this.RFConnectionErrorNodes = bitArrayToArray(this.Data.subarray(26, 52));
		this.ioKeyErrorExistingNodes = bitArrayToArray(this.Data.subarray(52, 78));
		this.RemovedNodes = bitArrayToArray(this.Data.subarray(78, 104));
		this.OpenNodes = bitArrayToArray(this.Data.subarray(104, 130));
		this.DiscoverStatus = this.Data.readUInt8(130);
	}
}
