import { GW_FRAME_REQ } from "./common";
export declare class GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ extends GW_FRAME_REQ {
    readonly ActivateConfigurationNodes: number[];
    constructor(ActivateConfigurationNodes: number[]);
}
