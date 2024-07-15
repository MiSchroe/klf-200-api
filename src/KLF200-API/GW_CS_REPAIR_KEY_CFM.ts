"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_CS_REPAIR_KEY_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_CS_REPAIR_KEY_CFM;
}
