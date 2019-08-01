import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_DELETE_SCENE_CFM extends GW_FRAME_CFM {
    readonly SceneID: number;
    readonly Status: GW_COMMON_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
