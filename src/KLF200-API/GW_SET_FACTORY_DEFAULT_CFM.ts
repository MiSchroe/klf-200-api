"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_SET_FACTORY_DEFAULT_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_SET_FACTORY_DEFAULT_CFM;
}
