'use strict';

import { GW_FRAME_CFM } from "./common";
import { ActivateSceneStatus } from "./GW_SCENES";

export class GW_ACTIVATE_SCENE_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly Status: ActivateSceneStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.SessionID = this.Data.readUInt16BE(1);
    }

    public getError(): string {
        switch (this.Status) {
            case ActivateSceneStatus.OK:
                return "No error.";
                
            case ActivateSceneStatus.InvalidParameter:
                return "Invalid parameter.";

            case ActivateSceneStatus.RequestRejected:
                return "Request rejected.";
        
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
