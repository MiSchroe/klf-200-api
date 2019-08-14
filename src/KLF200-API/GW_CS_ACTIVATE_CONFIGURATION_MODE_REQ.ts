"use strict";

import { GW_FRAME_REQ } from "./common";
import { arrayToBitArray } from "../utils/BitArray";

export class GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ extends GW_FRAME_REQ {
    constructor(readonly ActivateConfigurationNodes: number[]) {
        super(26);

        const buff = this.Data.slice(this.offset);
        arrayToBitArray(this.ActivateConfigurationNodes, 26, buff);
    }
}