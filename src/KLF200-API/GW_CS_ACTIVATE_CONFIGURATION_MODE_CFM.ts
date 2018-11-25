'use strict';

import { GW_FRAME_CFM } from "./common";
import { bitArrayToArray } from "../utils/BitArray";

export class GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM extends GW_FRAME_CFM {
    public readonly ActivatedNodes: number[];
    public readonly NoContactNodes: number[];
    public readonly OtherErrorNodes: number[];
    public readonly Status: number;

    constructor(Data: Buffer) {
        super(Data);

        this.ActivatedNodes = bitArrayToArray(this.Data.slice(0, 26));
        this.NoContactNodes = bitArrayToArray(this.Data.slice(26, 52));
        this.OtherErrorNodes = bitArrayToArray(this.Data.slice(52, 78));
        this.Status = this.Data.readUInt8(78);
    }

    public getError(): string {
        switch (this.Status) {
            case 0:
                throw new Error("No error.");
        
            default:
                return `Error code ${this.Status.toString()}.`;
        }
    }
}
