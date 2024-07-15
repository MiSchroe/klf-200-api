"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export enum GW_ERROR {
	NotFurtherDefined = 0,
	UnknownCommand = 1,
	InvalidFrameStructure = 2,
	Busy = 7,
	InvalidSystemTableIndex = 8,
	NotAuthenticated = 12,
	UnknonwErrorCode = 255,
}

export class GW_ERROR_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_ERROR_NTF;
	public readonly ErrorNumber: GW_ERROR;

	constructor(Data: Buffer) {
		super(Data);

		const errorNumber = this.Data.readUInt8(0);
		if (errorNumber in GW_ERROR) this.ErrorNumber = <GW_ERROR>errorNumber;
		else this.ErrorNumber = GW_ERROR.UnknonwErrorCode;
	}

	public getError(): string {
		switch (this.ErrorNumber) {
			case GW_ERROR.NotFurtherDefined:
				return "Not further defined error.";

			case GW_ERROR.UnknownCommand:
				return "Unknown command.";

			case GW_ERROR.InvalidFrameStructure:
				return "Invalid frame structure.";

			case GW_ERROR.Busy:
				return "Busy.";

			case GW_ERROR.InvalidSystemTableIndex:
				return "Invalid system table index.";

			case GW_ERROR.NotAuthenticated:
				return "Not authenticated.";

			default:
				return `Unknown error (${this.ErrorNumber.toString()}).`;
		}
	}
}
