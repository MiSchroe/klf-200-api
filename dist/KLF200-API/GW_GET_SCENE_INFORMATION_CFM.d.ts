import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_GET_SCENE_INFORMATION_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    readonly SceneID: number;
    constructor(Data: Buffer);
    getError(): string;
}
