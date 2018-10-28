import { GW_FRAME_NTF } from "./common";
import { SystemTableDataEntry } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends GW_FRAME_NTF {
    private _numberOfEntries;
    readonly NumberOfEntries: number;
    private _remainingNumberOfEntries;
    readonly RemainingNumberOfEntries: number;
    private _SystemTableEntries;
    readonly SystemTableEntries: SystemTableDataEntry[];
}
