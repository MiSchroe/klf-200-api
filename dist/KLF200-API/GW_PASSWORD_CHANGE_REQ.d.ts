import { GW_FRAME_REQ } from "./common";
export declare class GW_PASSWORD_CHANGE_REQ extends GW_FRAME_REQ {
    readonly OldPassword: string;
    readonly NewPassword: string;
    constructor(OldPassword: string, NewPassword: string);
}
