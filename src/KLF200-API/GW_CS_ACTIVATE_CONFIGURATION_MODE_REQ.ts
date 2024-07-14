"use strict";

import { arrayToBitArray } from "../utils/BitArray.js";
import { GatewayCommand, GW_FRAME_REQ } from "./common.js";

export class GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ extends GW_FRAME_REQ {
	declare readonly Command: GatewayCommand.GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ;
	constructor(readonly ActivateConfigurationNodes: number[]) {
		super(26);

		const buff = this.Data.subarray(this.offset);
		arrayToBitArray(this.ActivateConfigurationNodes, 26, buff);
	}
}
