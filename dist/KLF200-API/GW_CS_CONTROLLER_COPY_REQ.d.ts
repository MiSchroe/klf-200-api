import { GW_FRAME_REQ } from "./common";
import { ControllerCopyMode } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_CONTROLLER_COPY_REQ extends GW_FRAME_REQ {
    readonly ControllerCopyMode: ControllerCopyMode;
    constructor(ControllerCopyMode: ControllerCopyMode);
}
