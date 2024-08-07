"use strict";

import { GatewayCommand, GW_FRAME_COMMAND_REQ } from "./common.js";
import { CommandOriginator, PriorityLevel } from "./GW_COMMAND.js";
import { Velocity } from "./GW_SYSTEMTABLE_DATA.js";

export class GW_ACTIVATE_SCENE_REQ extends GW_FRAME_COMMAND_REQ {
	declare readonly Command: GatewayCommand.GW_ACTIVATE_SCENE_REQ;
	constructor(
		readonly SceneID: number,
		readonly PriorityLevel: PriorityLevel = 3,
		readonly CommandOriginator: CommandOriginator = 1,
		readonly Velocity: Velocity = 0,
	) {
		super(6);

		const buff = this.Data.subarray(this.offset);

		buff.writeUInt16BE(this.SessionID, 0);
		buff.writeUInt8(this.CommandOriginator, 2);
		buff.writeUInt8(this.PriorityLevel, 3);
		buff.writeUInt8(this.SceneID, 4);
		buff.writeUInt8(this.Velocity, 5);
	}
}
