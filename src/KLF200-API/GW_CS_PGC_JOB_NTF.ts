"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export enum PGCJobState {
	PGCJobStarted = 0,
	PGCJobEnded = 1,
	CSBusy = 2,
}

export enum PGCJobStatus {
	OK = 0,
	PartialOK = 1,
	Failed_JobError = 2,
	Failed_CancelledOrTooLongKeyPress = 3,
}

export enum PGCJobType {
	ReceiveSystemCopy = 0,
	ReceiveKey,
	TransmitKey,
	GenerateKey,
}

export class GW_CS_PGC_JOB_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_CS_PGC_JOB_NTF;
	public readonly PGCJobState: PGCJobState;
	public readonly PGCJobStatus: PGCJobStatus;
	public readonly PGCJobType: PGCJobType;

	constructor(Data: Buffer) {
		super(Data);

		this.PGCJobState = this.Data.readUInt8(0);
		this.PGCJobStatus = this.Data.readUInt8(1);
		this.PGCJobType = this.Data.readUInt8(2);
	}
}
