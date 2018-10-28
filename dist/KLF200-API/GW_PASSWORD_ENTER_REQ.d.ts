import { GW_FRAME_REQ } from "./common";
export declare class GW_PASSWORD_ENTER_REQ extends GW_FRAME_REQ {
    constructor(password: string);
    Password: string;
    protected InitializeBuffer(): void;
}
