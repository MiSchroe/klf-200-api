import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive, PriorityLevelLock, FunctionalParameter, PriorityLevelInformation } from "./GW_COMMAND";
export declare class GW_COMMAND_SEND_REQ extends GW_FRAME_REQ {
    readonly Nodes: number[] | number;
    readonly MainValue: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly ParameterActive: ParameterActive;
    readonly FunctionalParameters: FunctionalParameter[];
    readonly PriorityLevelLock: PriorityLevelLock;
    readonly PriorityLevels: PriorityLevelInformation[];
    readonly LockTime: number;
    readonly SessionID: number;
    constructor(Nodes: number[] | number, MainValue: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, ParameterActive?: ParameterActive, FunctionalParameters?: FunctionalParameter[], PriorityLevelLock?: PriorityLevelLock, PriorityLevels?: PriorityLevelInformation[], LockTime?: number);
    protected InitializeBuffer(): void;
}
