'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class SoftwareVersion {
    constructor(CommandVersion, MainVersion, SubVersion, BranchID, Build, MicroBuild) {
        this.CommandVersion = CommandVersion;
        this.MainVersion = MainVersion;
        this.SubVersion = SubVersion;
        this.BranchID = BranchID;
        this.Build = Build;
        this.MicroBuild = MicroBuild;
    }
    toString() {
        return `${this.CommandVersion.toString()}.${this.MainVersion.toString()}.${this.SubVersion.toString()}.${this.BranchID.toString()}.${this.Build.toString()}.${this.MicroBuild.toString()}`;
    }
}
exports.SoftwareVersion = SoftwareVersion;
class GW_GET_VERSION_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SoftwareVersion = new SoftwareVersion(this.Data.readUInt8(0), this.Data.readUInt8(1), this.Data.readUInt8(2), this.Data.readUInt8(3), this.Data.readUInt8(4), this.Data.readUInt8(5));
        this.HardwareVersion = this.Data.readUInt8(6);
        this.ProductGroup = this.Data.readUInt8(7);
        this.ProductType = this.Data.readUInt8(8);
    }
}
exports.GW_GET_VERSION_CFM = GW_GET_VERSION_CFM;
//# sourceMappingURL=GW_GET_VERSION_CFM.js.map