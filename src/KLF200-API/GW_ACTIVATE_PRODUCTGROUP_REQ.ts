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
import { Velocity } from "./GW_SYSTEMTABLE_DATA.js";

export class GW_ACTIVATE_PRODUCTGROUP_REQ extends GW_FRAME_COMMAND_REQ {
	constructor(
		readonly GroupID: number,
		readonly Position: number,
		readonly PriorityLevel: PriorityLevel = 3,
		readonly CommandOriginator: CommandOriginator = 1,
		readonly ParameterActive: ParameterActive = 0,
		readonly Velocity: Velocity = 0,
		readonly PriorityLevelLock: PriorityLevelLock = 0,
		readonly PriorityLevels: PriorityLevelInformation[] = [],
		readonly LockTime: number = Infinity,
	) {
		super(13);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt16BE(this.SessionID, 0);
		buff.writeUInt8(this.CommandOriginator, 2);
		buff.writeUInt8(this.PriorityLevel, 3);
		buff.writeUInt8(this.GroupID, 4);
		buff.writeUInt8(this.ParameterActive, 5);
		buff.writeUInt16BE(this.Position, 6);
		buff.writeUInt8(this.Velocity, 8);

		buff.writeUInt8(this.PriorityLevelLock, 9);
		if (this.PriorityLevels.length > 8) throw new Error("Too many priority levels.");

		let PLI = 0;
		for (let pliIndex = 0; pliIndex < this.PriorityLevels.length; pliIndex++) {
			const pli = this.PriorityLevels[pliIndex];
			if (pli < 0 || pli > 3) throw new Error("Priority level lock out of range.");

			PLI <<= 2;
			PLI |= pli;
		}
		PLI <<= 2 * (8 - this.PriorityLevels.length); // Shift remaining, if provided priority leves are less than 8
		buff.writeUInt16BE(PLI, 10);
		buff.writeUInt8(lt.lockTimeTolockTimeValue(this.LockTime), 12);
	}
}
