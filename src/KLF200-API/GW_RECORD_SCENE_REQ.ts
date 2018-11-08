'use strict';

import { GW_FRAME_REQ } from "./common";

export class GW_RECORD_SCENE_REQ extends GW_FRAME_REQ {
    constructor(readonly Name: string) {
        super();

        if (Buffer.from(Name).byteLength > 64)
            throw "Name too long.";

        const buff = this.Data.slice(this.offset);
        buff.write(this.Name, 0);
    }

    protected InitializeBuffer() {
        this.AllocBuffer(64);
    }
}