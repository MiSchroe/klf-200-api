"use strict";

import { GW_FRAME_CFM } from "./common";

export class SoftwareVersion {
	public constructor(
		readonly CommandVersion: number,
		readonly MainVersion: number,
		readonly SubVersion: number,
		readonly BranchID: number,
		readonly Build: number,
		readonly MicroBuild: number,
	) {}
	public toString(): string {
		return `${this.CommandVersion.toString()}.${this.MainVersion.toString()}.${this.SubVersion.toString()}.${this.BranchID.toString()}.${this.Build.toString()}.${this.MicroBuild.toString()}`;
	}
}

export class GW_GET_VERSION_CFM extends GW_FRAME_CFM {
	public readonly SoftwareVersion: SoftwareVersion;
	public readonly HardwareVersion: number;
	public readonly ProductGroup: number;
	public readonly ProductType: number;

	constructor(Data: Buffer) {
		super(Data);

		this.SoftwareVersion = new SoftwareVersion(
			this.Data.readUInt8(0),
			this.Data.readUInt8(1),
			this.Data.readUInt8(2),
			this.Data.readUInt8(3),
			this.Data.readUInt8(4),
			this.Data.readUInt8(5),
		);
		this.HardwareVersion = this.Data.readUInt8(6);
		this.ProductGroup = this.Data.readUInt8(7);
		this.ProductType = this.Data.readUInt8(8);
	}
}
