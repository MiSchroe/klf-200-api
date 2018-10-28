'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const C_MAX_PWD_LENGTH = 32;
class GW_PASSWORD_ENTER_REQ extends common_1.GW_FRAME_REQ {
    constructor(password) {
        super();
        this.Password = password;
    }
    set Password(newPassword) {
        const buffer = Buffer.from(newPassword, "utf8");
        if (buffer.byteLength > C_MAX_PWD_LENGTH)
            throw new Error("Password must not exceed 32 characters length.");
        this.Data.fill(0, this.offset);
        buffer.copy(this.Data, this.offset);
    }
    InitializeBuffer() {
        this.AllocBuffer(C_MAX_PWD_LENGTH);
    }
}
exports.GW_PASSWORD_ENTER_REQ = GW_PASSWORD_ENTER_REQ;
//# sourceMappingURL=GW_PASSWORD_ENTER_REQ.js.map