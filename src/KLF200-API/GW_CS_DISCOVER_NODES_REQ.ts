'use strict';

import { GW_FRAME_REQ } from "./common";
import { ActuatorType } from "./GW_SYSTEMTABLE_DATA";

export class GW_CS_DISCOVER_NODES_REQ extends GW_FRAME_REQ {
    constructor(readonly NodeType: ActuatorType = ActuatorType.NO_TYPE) {
        super(1);

        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.NodeType, 0);
    }
}