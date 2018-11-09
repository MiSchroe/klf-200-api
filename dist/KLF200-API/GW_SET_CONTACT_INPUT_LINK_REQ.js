'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_CONTACT_INPUT_LINK_REQ extends common_1.GW_FRAME_REQ {
    constructor(ContactInputID, ContactInputAssignment, SuccessOutputID, ErrorOutputID, Position, Velocity = 0, ActionID, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0, LockPriorityLevel = 0, PLI3 = 0, PLI4 = 0, PLI5 = 0, PLI6 = 0, PLI7 = 0) {
        super();
        this.ContactInputID = ContactInputID;
        this.ContactInputAssignment = ContactInputAssignment;
        this.SuccessOutputID = SuccessOutputID;
        this.ErrorOutputID = ErrorOutputID;
        this.Position = Position;
        this.Velocity = Velocity;
        this.ActionID = ActionID;
        this.PriorityLevel = PriorityLevel;
        this.CommandOriginator = CommandOriginator;
        this.ParameterActive = ParameterActive;
        this.LockPriorityLevel = LockPriorityLevel;
        this.PLI3 = PLI3;
        this.PLI4 = PLI4;
        this.PLI5 = PLI5;
        this.PLI6 = PLI6;
        this.PLI7 = PLI7;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.ContactInputID, 0);
        buff.writeUInt8(this.ContactInputAssignment, 1);
        buff.writeUInt8(this.ActionID, 2);
        buff.writeUInt8(this.CommandOriginator, 3);
        buff.writeUInt8(this.PriorityLevel, 4);
        buff.writeUInt8(this.ParameterActive, 5);
        buff.writeUInt16BE(this.Position, 6);
        buff.writeUInt8(this.Velocity, 8);
        buff.writeUInt8(this.LockPriorityLevel, 9);
        buff.writeUInt8(this.PLI3, 10);
        buff.writeUInt8(this.PLI4, 11);
        buff.writeUInt8(this.PLI5, 12);
        buff.writeUInt8(this.PLI6, 13);
        buff.writeUInt8(this.PLI7, 14);
        buff.writeUInt8(this.SuccessOutputID, 15);
        buff.writeUInt8(this.ErrorOutputID, 16);
    }
    InitializeBuffer() {
        this.AllocBuffer(17);
    }
}
exports.GW_SET_CONTACT_INPUT_LINK_REQ = GW_SET_CONTACT_INPUT_LINK_REQ;
//# sourceMappingURL=GW_SET_CONTACT_INPUT_LINK_REQ.js.map