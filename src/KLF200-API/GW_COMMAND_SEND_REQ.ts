"use strict";

import { GW_FRAME_COMMAND_REQ } from "./common";
import {
	CommandOriginator,
	PriorityLevel,
	ParameterActive,
	PriorityLevelLock,
	LockTime as lt,
	FunctionalParameter,
	PriorityLevelInformation,
} from "./GW_COMMAND";

export class GW_COMMAND_SEND_REQ extends GW_FRAME_COMMAND_REQ {
	constructor(
		readonly Nodes: number[] | number,
		readonly MainValue: number,
		readonly PriorityLevel: PriorityLevel = 3,
		readonly CommandOriginator: CommandOriginator = 1,
		readonly ParameterActive: ParameterActive = 0,
		readonly FunctionalParameters: FunctionalParameter[] = [],
		readonly PriorityLevelLock: PriorityLevelLock = 0,
		readonly PriorityLevels: PriorityLevelInformation[] = [],
		readonly LockTime: number = Infinity,
	) {
		super(66);

		const buff = this.Data.slice(this.offset);

		buff.writeUInt16BE(this.SessionID, 0);
		buff.writeUInt8(this.CommandOriginator, 2);
		buff.writeUInt8(this.PriorityLevel, 3);
		buff.writeUInt8(this.ParameterActive, 4);
		let FPI1 = 0;
		let FPI2 = 0;
		for (
			let functionalParameterIndex = 0;
			functionalParameterIndex < this.FunctionalParameters.length;
			functionalParameterIndex++
		) {
			const functionalParameter = this.FunctionalParameters[functionalParameterIndex];
			const functionalParameterID = functionalParameter.ID - 1;
			if (functionalParameterID < 0 || functionalParameterID > 15)
				throw new Error("Functional paramter ID out of range.");

			if (functionalParameterID < 8) {
				FPI1 |= 0x80 >>> functionalParameterID;
			} else {
				FPI2 |= 0x80 >>> (functionalParameterID - 8);
			}
			buff.writeUInt16BE(functionalParameter.Value, 9 + 2 * functionalParameterID);
		}
		buff.writeUInt8(FPI1, 5);
		buff.writeUInt8(FPI2, 6);
		buff.writeUInt16BE(this.MainValue, 7);

		// Multiple nodes are provided
		if (Array.isArray(this.Nodes)) {
			if (this.Nodes.length > 20) throw new Error("Too many nodes.");

			buff.writeUInt8(this.Nodes.length, 41);
			for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
				const node = this.Nodes[nodeIndex];
				buff.writeUInt8(node, 42 + nodeIndex);
			}
		} else {
			buff.writeUInt8(1, 41);
			buff.writeUInt8(this.Nodes, 42);
		}

		buff.writeUInt8(this.PriorityLevelLock, 62);
		if (this.PriorityLevels.length > 8) throw new Error("Too many priority levels.");

		let PLI = 0;
		for (let pliIndex = 0; pliIndex < this.PriorityLevels.length; pliIndex++) {
			const pli = this.PriorityLevels[pliIndex];
			if (pli < 0 || pli > 3) throw new Error("Priority level lock out of range.");

			PLI <<= 2;
			PLI |= pli;
		}
		PLI <<= 2 * (8 - this.PriorityLevels.length); // Shift remaining, if provided priority leves are less than 8
		buff.writeUInt16BE(PLI, 63);
		buff.writeUInt8(lt.lockTimeTolockTimeValue(this.LockTime), 65);
	}
}
