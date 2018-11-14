import { GW_FRAME_COMMAND_REQ } from "./common";
import { CommandOriginator, PriorityLevel } from "./GW_COMMAND";
export declare class GW_WINK_SEND_REQ extends GW_FRAME_COMMAND_REQ {
    readonly Nodes: number[] | number;
    readonly EnableWink: boolean;
    readonly WinkTime: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    constructor(Nodes: number[] | number, EnableWink?: boolean, WinkTime?: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator);
    protected InitializeBuffer(): void;
}
