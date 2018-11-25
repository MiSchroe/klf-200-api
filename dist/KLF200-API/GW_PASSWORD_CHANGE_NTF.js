'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_PASSWORD_CHANGE_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.NewPassword = common_1.readZString(this.Data);
    }
}
exports.GW_PASSWORD_CHANGE_NTF = GW_PASSWORD_CHANGE_NTF;
