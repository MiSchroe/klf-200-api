"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_NETWORK_SETUP_REQ extends common_1.GW_FRAME_REQ {
    constructor(DHCP, IPAddress = "0.0.0.0", Mask = "0.0.0.0", DefaultGateway = "0.0.0.0") {
        super(13);
        this.DHCP = DHCP;
        this.IPAddress = IPAddress;
        this.Mask = Mask;
        this.DefaultGateway = DefaultGateway;
        // Check for valid IP address formats:
        const checkIPv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!checkIPv4.test(this.IPAddress))
            throw new Error("Invalid IP address for parameter IPAddress.");
        if (!checkIPv4.test(this.Mask))
            throw new Error("Invalid IP address for parameter Mask.");
        if (!checkIPv4.test(this.DefaultGateway))
            throw new Error("Invalid IP address for parameter DefaultGateway.");
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(DHCP ? 1 : 0, 12);
        if (!DHCP) {
            let buffIndex = 0;
            this.IPAddress.split(".").forEach(addressPart => {
                buff.writeUInt8(parseInt(addressPart), buffIndex++);
            });
            this.Mask.split(".").forEach(addressPart => {
                buff.writeUInt8(parseInt(addressPart), buffIndex++);
            });
            this.DefaultGateway.split(".").forEach(addressPart => {
                buff.writeUInt8(parseInt(addressPart), buffIndex++);
            });
        }
    }
}
exports.GW_SET_NETWORK_SETUP_REQ = GW_SET_NETWORK_SETUP_REQ;
//# sourceMappingURL=GW_SET_NETWORK_SETUP_REQ.js.map