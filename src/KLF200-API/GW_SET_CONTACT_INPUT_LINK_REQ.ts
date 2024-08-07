"use strict";

import { GatewayCommand, GW_FRAME_REQ } from "./common.js";
import { CommandOriginator, ParameterActive, PriorityLevel, PriorityLevelInformation } from "./GW_COMMAND.js";
import { ContactInputAssignment, LockPriorityLevel } from "./GW_CONTACTINPUT.js";
import { Velocity } from "./GW_SYSTEMTABLE_DATA.js";

export class GW_SET_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_SET_CONTACT_INPUT_LINK_REQ;
	constructor(
		readonly ContactInputID: number,
		readonly ContactInputAssignment: ContactInputAssignment,
		readonly SuccessOutputID: number,
		readonly ErrorOutputID: number,
		readonly Position: number,
		readonly Velocity: Velocity = 0,
		readonly ActionID: number,
		readonly PriorityLevel: PriorityLevel = 3,
		readonly CommandOriginator: CommandOriginator = 1,
		readonly ParameterActive: ParameterActive = 0,
		readonly LockPriorityLevel: LockPriorityLevel = 0,
		readonly PLI3: PriorityLevelInformation = PriorityLevelInformation.KeepCurrent,
		readonly PLI4: PriorityLevelInformation = PriorityLevelInformation.KeepCurrent,
		readonly PLI5: PriorityLevelInformation = PriorityLevelInformation.KeepCurrent,
		readonly PLI6: PriorityLevelInformation = PriorityLevelInformation.KeepCurrent,
		readonly PLI7: PriorityLevelInformation = PriorityLevelInformation.KeepCurrent,
	) {
		super(17);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt8(this.ContactInputID, 0);
		buff.writeUInt8(this.ContactInputAssignment, 1);
		buff.writeUInt8(this.ActionID, 2);
		buff.writeUInt8(this.CommandOriginator, 3);
		buff.writeUInt8(this.PriorityLevel, 4);
		buff.writeUInt8(this.ParameterActive, 5);
		buff.writeUInt16BE(this.Position, 6);
		buff.writeUInt8(this.Velocity, 8);
		buff.writeUInt8(this.LockPriorityLevel, 9);
		buff.writeUInt8(this.PLI3, 10);
		buff.writeUInt8(this.PLI4, 11);
		buff.writeUInt8(this.PLI5, 12);
		buff.writeUInt8(this.PLI6, 13);
		buff.writeUInt8(this.PLI7, 14);
		buff.writeUInt8(this.SuccessOutputID, 15);
		buff.writeUInt8(this.ErrorOutputID, 16);
	}
}
