'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
import { ContactInputAssignment, LockPriorityLevel } from "./GW_CONTACTINPUT";
import { CommandOriginator, PriorityLevel, ParameterActive } from "./GW_COMMAND";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";

export type ContactInputObject = {
    ContactInputID: number,
    ContactInputAssignment: ContactInputAssignment,
    ActionID: number,
    CommandOriginator: CommandOriginator,
    PriorityLevel: PriorityLevel,
    ParameterActive: ParameterActive,
    Position: number,
    Velocity: Velocity,
    LockPriorityLevel: LockPriorityLevel,
    PLI3: number,
    PLI4: number,
    PLI5: number,
    PLI6: number,
    PLI7: number,
    SuccessOutputID: number,
    ErrorOutputID: number
}

export class GW_GET_CONTACT_INPUT_LINK_LIST_CFM extends GW_FRAME_CFM {
    public readonly ContactInputObjects: ContactInputObject[] = [];
    
    constructor(Data: Buffer) {
        super(Data);

        const numberOfObjects = this.Data.readUInt8(0);
        for (let objectIndex = 0; objectIndex < numberOfObjects; objectIndex++) {
            const contactInputObject: ContactInputObject = {
                ContactInputID: this.Data.readUInt8(objectIndex * 17 + 1),
                ContactInputAssignment: this.Data.readUInt8(objectIndex * 17 + 2),
                ActionID: this.Data.readUInt8(objectIndex * 17 + 3),
                CommandOriginator: this.Data.readUInt8(objectIndex * 17 + 4),
                PriorityLevel: this.Data.readUInt8(objectIndex * 17 + 5),
                ParameterActive: this.Data.readUInt8(objectIndex * 17 + 6),
                Position: this.Data.readUInt16BE(objectIndex * 17 + 7),
                Velocity: this.Data.readUInt8(objectIndex * 17 + 9),
                LockPriorityLevel: this.Data.readUInt8(objectIndex * 17 + 10),
                PLI3: this.Data.readUInt8(objectIndex * 17 + 11),
                PLI4: this.Data.readUInt8(objectIndex * 17 + 12),
                PLI5: this.Data.readUInt8(objectIndex * 17 + 13),
                PLI6: this.Data.readUInt8(objectIndex * 17 + 14),
                PLI7: this.Data.readUInt8(objectIndex * 17 + 15),
                SuccessOutputID: this.Data.readUInt8(objectIndex * 17 + 16),
                ErrorOutputID: this.Data.readUInt8(objectIndex * 17 + 17)
            };
            this.ContactInputObjects.push(contactInputObject);
        }
    }
}
