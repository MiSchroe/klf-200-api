"use strict";

import { GW_FRAME_NTF } from "./common";
import { InitializeSceneNotificationStatus } from "./GW_SCENES";
import { bitArrayToArray } from "../utils/BitArray";

export class GW_INITIALIZE_SCENE_NTF extends GW_FRAME_NTF {
    public readonly Status: InitializeSceneNotificationStatus;
    public readonly FailedNodes: number[];

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.FailedNodes = bitArrayToArray(this.Data.slice(1, 26));
    }
}
