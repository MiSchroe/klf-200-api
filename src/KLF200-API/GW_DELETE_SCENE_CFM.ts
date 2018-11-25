'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";

export class GW_DELETE_SCENE_CFM extends GW_FRAME_CFM {
    public readonly SceneID: number;
    public readonly Status: GW_COMMON_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }

    public getError(): string {
        switch (this.Status) {
            case GW_COMMON_STATUS.SUCCESS:
                throw new Error("No error.");
                
            case GW_COMMON_STATUS.ERROR:
                return "Request failed.";

            case GW_COMMON_STATUS.INVALID_NODE_ID:
                return "Invalid scene ID.";
        
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
