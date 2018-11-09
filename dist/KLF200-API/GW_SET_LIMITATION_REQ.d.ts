import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive } from "./GW_COMMAND";
export declare class GW_SET_LIMITATION_REQ extends GW_FRAME_REQ {
    readonly Nodes: number[] | number;
    readonly LimitationValueMin: number;
    readonly LimitationValueMax: number;
    readonly LimitationTime: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly ParameterActive: ParameterActive;
    readonly SessionID: number;
    constructor(Nodes: number[] | number, LimitationValueMin: number, LimitationValueMax: number, LimitationTime: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, ParameterActive?: ParameterActive);
    protected InitializeBuffer(): void;
}
