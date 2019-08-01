import { GW_FRAME_CFM } from "./common";
import { RenameSceneStatus } from "./GW_SCENES";
export declare class GW_RENAME_SCENE_CFM extends GW_FRAME_CFM {
    readonly Status: RenameSceneStatus;
    readonly SceneID: number;
    constructor(Data: Buffer);
    getError(): string;
}
