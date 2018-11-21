import { GW_FRAME_REQ } from "./common";
export declare class GW_REMOVE_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
    readonly ContactInputID: number;
    constructor(ContactInputID: number);
}
