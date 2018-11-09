import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive, PriorityLevelLock } from "./GW_COMMAND";
export declare class GW_MODE_SEND_REQ extends GW_FRAME_REQ {
    readonly Nodes: number[] | number;
    readonly ModeNumber: number;
    readonly ModeParameter: ParameterActive;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly PriorityLevelLock: PriorityLevelLock;
    readonly PriorityLevels: number[];
    readonly LockTime: number;
    readonly SessionID: number;
    constructor(Nodes: number[] | number, ModeNumber?: number, ModeParameter?: ParameterActive, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, PriorityLevelLock?: PriorityLevelLock, PriorityLevels?: number[], LockTime?: number);
    protected InitializeBuffer(): void;
}
