'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_REMOVE_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
    constructor(readonly ContactInputID: number) {
        super();

        const buff = this.Data.slice(this.offset);

        buff.writeUInt8(this.ContactInputID, 0);
    }

    protected InitializeBuffer() {
        this.AllocBuffer(1);
    }
}