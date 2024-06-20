"use strict";

import { GW_FRAME_COMMAND_REQ } from "./common.js";
import {
	CommandOriginator,
	LockTime as lt,
	ParameterActive,
	PriorityLevel,
	PriorityLevelInformation,
	PriorityLevelLock,
} from "./GW_COMMAND.js";

export class GW_MODE_SEND_REQ extends GW_FRAME_COMMAND_REQ {
	constructor(
		readonly Nodes: number[] | number,
		readonly ModeNumber: number = 0,
		readonly ModeParameter: ParameterActive = 0,
		readonly PriorityLevel: PriorityLevel = 3,
		readonly CommandOriginator: CommandOriginator = 1,
		readonly PriorityLevelLock: PriorityLevelLock = 0,
		readonly PriorityLevels: PriorityLevelInformation[] = [],
		readonly LockTime: number = Infinity,
	) {
		super(31);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt16BE(this.SessionID, 0);
		buff.writeUInt8(this.CommandOriginator, 2);
		buff.writeUInt8(this.PriorityLevel, 3);
		buff.writeUInt8(this.ModeNumber, 4);
		buff.writeUInt8(this.ModeParameter, 5);

		// Multiple nodes are provided
		if (Array.isArray(this.Nodes)) {
			if (this.Nodes.length > 20) throw new Error("Too many nodes.");

			buff.writeUInt8(this.Nodes.length, 6);
			for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
				const node = this.Nodes[nodeIndex];
				buff.writeUInt8(node, 7 + nodeIndex);
			}
		} else {
			buff.writeUInt8(1, 6);
			buff.writeUInt8(this.Nodes, 7);
		}

		buff.writeUInt8(this.PriorityLevelLock, 27);
		if (this.PriorityLevels.length > 8) throw new Error("Too many priority levels.");

		let PLI = 0;
		for (let pliIndex = 0; pliIndex < this.PriorityLevels.length; pliIndex++) {
			const pli = this.PriorityLevels[pliIndex];
			if (pli < 0 || pli > 3) throw new Error("Priority level lock out of range.");

			PLI <<= 2;
			PLI |= pli;
		}
		PLI <<= 2 * (8 - this.PriorityLevels.length); // Shift remaining, if provided priority leves are less than 8
		buff.writeUInt16BE(PLI, 28);
		buff.writeUInt8(lt.lockTimeTolockTimeValue(this.LockTime), 30);
	}
}
