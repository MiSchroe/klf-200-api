import { GW_FRAME_REQ } from "./common";
export declare class GW_GET_ACTIVATION_LOG_LINE_REQ extends GW_FRAME_REQ {
    readonly Line: number;
    constructor(Line: number);
    protected InitializeBuffer(): void;
}
