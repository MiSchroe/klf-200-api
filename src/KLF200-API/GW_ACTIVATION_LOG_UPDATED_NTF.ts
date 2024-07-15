"use strict";

import { GatewayCommand, GW_FRAME_NTF } from "./common.js";

export class GW_ACTIVATION_LOG_UPDATED_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_ACTIVATION_LOG_UPDATED_NTF;
}
