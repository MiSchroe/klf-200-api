'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_PASSWORD_ENTER_CFM extends common_1.GW_FRAME_CFM {
    constructor() {
        super(...arguments);
        this.Command = common_1.GatewayCommand.GW_PASSWORD_ENTER_CFM;
    }
    get Status() {
        const status = this.Data.readUInt8(0);
        return status;
    }
}
exports.GW_PASSWORD_ENTER_CFM = GW_PASSWORD_ENTER_CFM;
//# sourceMappingURL=GW_PASSWORD_ENTER_CFM.js.map