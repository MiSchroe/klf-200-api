"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_CLEAR_ACTIVATION_LOG_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_CLEAR_ACTIVATION_LOG_CFM;
}
