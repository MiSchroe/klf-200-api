import { GW_FRAME_NTF } from "./common";
export declare enum SceneChangeType {
    Deleted = 0,
    Modified = 1
}
export declare class GW_SCENE_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    readonly SceneID: number;
    readonly SceneChangeType: SceneChangeType;
    constructor(Data: Buffer);
}
