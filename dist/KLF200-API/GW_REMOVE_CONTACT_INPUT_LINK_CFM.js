'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_REMOVE_CONTACT_INPUT_LINK_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.ContactInputID = this.Data.readUInt8(0);
        this.Status = this.Data.readUInt8(1);
    }
}
exports.GW_REMOVE_CONTACT_INPUT_LINK_CFM = GW_REMOVE_CONTACT_INPUT_LINK_CFM;
//# sourceMappingURL=GW_REMOVE_CONTACT_INPUT_LINK_CFM.js.map