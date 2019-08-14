"use strict";

import { GW_FRAME_NTF } from "./common";

export enum SceneChangeType {
    Deleted = 0,
    Modified
}

export class GW_SCENE_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    public readonly SceneID: number;
    public readonly SceneChangeType: SceneChangeType;

    constructor(Data: Buffer) {
        super(Data);

        this.SceneChangeType = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }
}
