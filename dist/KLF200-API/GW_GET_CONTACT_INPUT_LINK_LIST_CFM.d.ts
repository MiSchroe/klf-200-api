/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { ContactInputAssignment, LockPriorityLevel } from "./GW_CONTACTINPUT";
import { CommandOriginator, PriorityLevel, ParameterActive } from "./GW_COMMAND";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare type ContactInputObject = {
    ContactInputID: number;
    ContactInputAssignment: ContactInputAssignment;
    ActionID: number;
    CommandOriginator: CommandOriginator;
    PriorityLevel: PriorityLevel;
    ParameterActive: ParameterActive;
    Position: number;
    Velocity: Velocity;
    LockPriorityLevel: LockPriorityLevel;
    PLI3: number;
    PLI4: number;
    PLI5: number;
    PLI6: number;
    PLI7: number;
    SuccessOutputID: number;
    ErrorOutputID: number;
};
export declare class GW_GET_CONTACT_INPUT_LINK_LIST_CFM extends GW_FRAME_CFM {
    readonly ContactInputObjects: ContactInputObject[];
    constructor(Data: Buffer);
}
