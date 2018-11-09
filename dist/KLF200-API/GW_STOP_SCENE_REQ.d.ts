import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel } from "./GW_COMMAND";
export declare class GW_STOP_SCENE_REQ extends GW_FRAME_REQ {
    readonly SceneID: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly SessionID: number;
    constructor(SceneID: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator);
    protected InitializeBuffer(): void;
}
