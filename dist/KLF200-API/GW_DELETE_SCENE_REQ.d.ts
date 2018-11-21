import { GW_FRAME_REQ } from "./common";
export declare class GW_DELETE_SCENE_REQ extends GW_FRAME_REQ {
    readonly SceneID: number;
    constructor(SceneID: number);
}
