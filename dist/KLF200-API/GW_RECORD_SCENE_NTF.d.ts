import { GW_FRAME_NTF } from "./common";
import { RecordSceneStatus } from "./GW_SCENES";
export declare class GW_RECORD_SCENE_NTF extends GW_FRAME_NTF {
    readonly Status: RecordSceneStatus;
    readonly SceneID: number;
    constructor(Data: Buffer);
}
