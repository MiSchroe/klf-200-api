'use strict';

import { GW_FRAME_CFM } from "./common";
import { RenameSceneStatus } from "./GW_SCENES";

export class GW_RENAME_SCENE_CFM extends GW_FRAME_CFM {
    public readonly Status: RenameSceneStatus;
    public readonly SceneID: number;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }
}
