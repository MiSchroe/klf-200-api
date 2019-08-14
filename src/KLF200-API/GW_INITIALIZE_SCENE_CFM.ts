"use strict";

import { GW_FRAME_CFM } from "./common";
import { InitializeSceneConfirmationStatus } from "./GW_SCENES";

export class GW_INITIALIZE_SCENE_CFM extends GW_FRAME_CFM {
    public readonly Status: InitializeSceneConfirmationStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
    }

    public getError(): string {
        switch (this.Status) {
            case InitializeSceneConfirmationStatus.OK:
                throw new Error("No error.");
                
            case InitializeSceneConfirmationStatus.EmptySystemTable:
                return "Empty system table.";

            case InitializeSceneConfirmationStatus.OutOfStorage:
                return "Out of storage for scene.";
        
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
