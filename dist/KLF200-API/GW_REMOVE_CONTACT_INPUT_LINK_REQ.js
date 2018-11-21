'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_REMOVE_CONTACT_INPUT_LINK_REQ extends common_1.GW_FRAME_REQ {
    constructor(ContactInputID) {
        super(1);
        this.ContactInputID = ContactInputID;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.ContactInputID, 0);
    }
}
exports.GW_REMOVE_CONTACT_INPUT_LINK_REQ = GW_REMOVE_CONTACT_INPUT_LINK_REQ;
//# sourceMappingURL=GW_REMOVE_CONTACT_INPUT_LINK_REQ.js.map