import { GW_FRAME_NTF } from "./common";
import { ParameterActive, CommandOriginator } from "./GW_COMMAND";
export declare class GW_LIMITATION_STATUS_NTF extends GW_FRAME_NTF {
    readonly SessionID: number;
    readonly NodeID: number;
    readonly ParameterID: ParameterActive;
    readonly LimitationValueMin: number;
    readonly LimitationValueMax: number;
    readonly LimitationOriginator: CommandOriginator;
    readonly LimitationTime: number;
    constructor(Data: Buffer);
}
