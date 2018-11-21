import { GW_FRAME_COMMAND_REQ } from "./common";
import { CommandOriginator, PriorityLevel } from "./GW_COMMAND";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_ACTIVATE_SCENE_REQ extends GW_FRAME_COMMAND_REQ {
    readonly SceneID: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly Velocity: Velocity;
    constructor(SceneID: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, Velocity?: Velocity);
}
