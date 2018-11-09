import { GW_FRAME_REQ } from "./common";
export declare class GW_RENAME_SCENE_REQ extends GW_FRAME_REQ {
    readonly SceneID: number;
    readonly Name: string;
    constructor(SceneID: number, Name: string);
    protected InitializeBuffer(): void;
}
