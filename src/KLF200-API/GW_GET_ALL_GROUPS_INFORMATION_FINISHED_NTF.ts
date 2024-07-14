"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF;
}
