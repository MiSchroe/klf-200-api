'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_DELETE_GROUP_REQ extends GW_FRAME_REQ {
    constructor(readonly GroupID: number) {
        super(1);

        this.Data.writeUInt8(this.GroupID, this.offset);
    }
}