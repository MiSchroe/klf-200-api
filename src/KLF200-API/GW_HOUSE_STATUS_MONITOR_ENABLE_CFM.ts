"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_HOUSE_STATUS_MONITOR_ENABLE_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_CFM;
}
