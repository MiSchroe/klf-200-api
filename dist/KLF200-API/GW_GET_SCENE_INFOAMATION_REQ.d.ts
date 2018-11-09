import { GW_FRAME_REQ } from "./common";
export declare class GW_GET_SCENE_INFOAMATION_REQ extends GW_FRAME_REQ {
    readonly SceneID: number;
    constructor(SceneID: number);
    protected InitializeBuffer(): void;
}
