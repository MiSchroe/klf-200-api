import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive, PriorityLevelLock } from "./GW_COMMAND";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_ACTIVATE_PRODUCTGROUP_REQ extends GW_FRAME_REQ {
    readonly GroupID: number;
    readonly Position: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly ParameterActive: ParameterActive;
    readonly Velocity: Velocity;
    readonly PriorityLevelLock: PriorityLevelLock;
    readonly PriorityLevels: number[];
    readonly LockTime: number;
    readonly SessionID: number;
    constructor(GroupID: number, Position: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, ParameterActive?: ParameterActive, Velocity?: Velocity, PriorityLevelLock?: PriorityLevelLock, PriorityLevels?: number[], LockTime?: number);
    protected InitializeBuffer(): void;
}
