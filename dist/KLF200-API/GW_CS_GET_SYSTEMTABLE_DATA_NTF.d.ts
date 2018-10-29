/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { SystemTableDataEntry } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends GW_FRAME_NTF {
    readonly NumberOfEntries: number;
    readonly RemainingNumberOfEntries: number;
    readonly SystemTableEntries: SystemTableDataEntry[];
    constructor(Data: Buffer);
}
