"use strict";

import { GW_FRAME_NTF, readZString } from "./common";
import { ParameterActive } from "./GW_COMMAND";

export type SceneInformationEntry = {
	NodeID: number;
	ParameterID: ParameterActive;
	ParameterValue: number;
};

export class GW_GET_SCENE_INFORMATION_NTF extends GW_FRAME_NTF {
	public readonly SceneID: number;
	public readonly Name: string;
	public readonly NumberOfNodes: number;
	public readonly NumberOfRemainingNodes: number;
	public readonly Nodes: SceneInformationEntry[] = [];

	constructor(Data: Buffer) {
		super(Data);

		this.SceneID = this.Data.readUInt8(0);
		this.Name = readZString(this.Data.subarray(1, 65));
		this.NumberOfNodes = this.Data.readUInt8(65);
		this.NumberOfRemainingNodes = this.Data.readUInt8(this.NumberOfNodes * 4 + 66);

		for (let nodeIndex = 0; nodeIndex < this.NumberOfNodes; nodeIndex++) {
			this.Nodes.push({
				NodeID: this.Data.readUInt8(nodeIndex * 4 + 66),
				ParameterID: this.Data.readUInt8(nodeIndex * 4 + 67),
				ParameterValue: this.Data.readUInt16BE(nodeIndex * 4 + 68),
			});
		}
	}
}
