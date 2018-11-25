'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_PASSWORD_CHANGE_REQ extends common_1.GW_FRAME_REQ {
    constructor(OldPassword, NewPassword) {
        super(common_1.C_MAX_PWD_LENGTH * 2);
        this.OldPassword = OldPassword;
        this.NewPassword = NewPassword;
        if (Buffer.from(this.OldPassword, "utf8").byteLength > common_1.C_MAX_PWD_LENGTH)
            throw `Old password must not exceed ${common_1.C_MAX_PWD_LENGTH} characters length.`;
        if (Buffer.from(this.NewPassword, "utf8").byteLength > common_1.C_MAX_PWD_LENGTH)
            throw `New password must not exceed ${common_1.C_MAX_PWD_LENGTH} characters length.`;
        this.Data.write(this.OldPassword, 0);
        this.Data.write(this.NewPassword, 31);
    }
}
exports.GW_PASSWORD_CHANGE_REQ = GW_PASSWORD_CHANGE_REQ;
