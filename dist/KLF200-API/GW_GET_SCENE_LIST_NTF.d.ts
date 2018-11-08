/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
export declare type SceneListEntry = {
    SceneID: number;
    Name: string;
};
export declare class GW_GET_SCENE_LIST_NTF extends GW_FRAME_NTF {
    readonly NumberOfScenes: number;
    readonly NumberOfRemainingScenes: number;
    readonly Scenes: SceneListEntry[];
    constructor(Data: Buffer);
}
