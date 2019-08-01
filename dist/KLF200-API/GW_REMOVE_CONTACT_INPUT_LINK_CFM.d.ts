import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";
export declare class GW_REMOVE_CONTACT_INPUT_LINK_CFM extends GW_FRAME_CFM {
    readonly ContactInputID: number;
    readonly Status: GW_INVERSE_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
