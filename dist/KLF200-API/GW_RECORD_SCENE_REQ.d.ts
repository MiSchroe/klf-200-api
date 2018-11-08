import { GW_FRAME_REQ } from "./common";
export declare class GW_RECORD_SCENE_REQ extends GW_FRAME_REQ {
    readonly Name: string;
    constructor(Name: string);
    protected InitializeBuffer(): void;
}
