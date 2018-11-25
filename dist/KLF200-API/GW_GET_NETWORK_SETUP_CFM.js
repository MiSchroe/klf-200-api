'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_NETWORK_SETUP_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.IPAddress = `${this.Data.readUInt8(0)}.${this.Data.readUInt8(1)}.${this.Data.readUInt8(2)}.${this.Data.readUInt8(3)}`;
        this.Mask = `${this.Data.readUInt8(4)}.${this.Data.readUInt8(5)}.${this.Data.readUInt8(6)}.${this.Data.readUInt8(7)}`;
        this.DefaultGateway = `${this.Data.readUInt8(8)}.${this.Data.readUInt8(9)}.${this.Data.readUInt8(10)}.${this.Data.readUInt8(11)}`;
        this.DHCP = this.Data.readUInt8(12) === 1;
    }
}
exports.GW_GET_NETWORK_SETUP_CFM = GW_GET_NETWORK_SETUP_CFM;
