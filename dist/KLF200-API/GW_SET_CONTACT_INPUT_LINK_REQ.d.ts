import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive } from "./GW_COMMAND";
import { ContactInputAssignment, LockPriorityLevel } from "./GW_CONTACTINPUT";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_SET_CONTACT_INPUT_LINK_REQ extends GW_FRAME_REQ {
    readonly ContactInputID: number;
    readonly ContactInputAssignment: ContactInputAssignment;
    readonly SuccessOutputID: number;
    readonly ErrorOutputID: number;
    readonly Position: number;
    readonly Velocity: Velocity;
    readonly ActionID: number;
    readonly PriorityLevel: PriorityLevel;
    readonly CommandOriginator: CommandOriginator;
    readonly ParameterActive: ParameterActive;
    readonly LockPriorityLevel: LockPriorityLevel;
    readonly PLI3: number;
    readonly PLI4: number;
    readonly PLI5: number;
    readonly PLI6: number;
    readonly PLI7: number;
    constructor(ContactInputID: number, ContactInputAssignment: ContactInputAssignment, SuccessOutputID: number, ErrorOutputID: number, Position: number, Velocity: Velocity, ActionID: number, PriorityLevel?: PriorityLevel, CommandOriginator?: CommandOriginator, ParameterActive?: ParameterActive, LockPriorityLevel?: LockPriorityLevel, PLI3?: number, PLI4?: number, PLI5?: number, PLI6?: number, PLI7?: number);
    protected InitializeBuffer(): void;
}
