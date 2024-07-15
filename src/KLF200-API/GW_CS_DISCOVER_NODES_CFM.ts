"use strict";

import { GatewayCommand, GW_FRAME_CFM } from "./common.js";

export class GW_CS_DISCOVER_NODES_CFM extends GW_FRAME_CFM {
	declare readonly Command: GatewayCommand.GW_CS_DISCOVER_NODES_CFM;
}
