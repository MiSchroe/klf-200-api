"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_SET_NODE_NAME_REQ extends GW_FRAME_REQ {
    constructor(readonly NodeID: number, readonly Name: string) {
        super(65);

        if (this.Name.length > 64) {
            throw new Error("Name too long. Max. 64 characters allowed.");
        }

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.NodeID, 0);
        buff.write(this.Name, 1, 64, "utf8");
    }
}