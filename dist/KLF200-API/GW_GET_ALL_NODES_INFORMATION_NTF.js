'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SYSTEMTABLE_DATA_1 = require("./GW_SYSTEMTABLE_DATA");
class GW_GET_ALL_NODES_INFORMATION_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.ActuatorAliases = [];
        this.NodeID = this.Data.readUInt8(0);
        this.Order = this.Data.readUInt16BE(1);
        this.Placement = this.Data.readUInt8(3);
        this.Name = common_1.readZString(this.Data.slice(4, 68));
        this.Velocity = this.Data.readUInt8(68);
        const actuatorTypes = GW_SYSTEMTABLE_DATA_1.splitActuatorType(this.Data.readUInt16BE(69));
        this.ActuatorType = actuatorTypes.ActuatorType;
        this.ActuatorSubType = actuatorTypes.ActuatorSubType;
        this.ProductType = this.Data.readUInt16BE(71);
        this.NodeVariation = this.Data.readUInt8(73);
        this.PowerSaveMode = this.Data.readUInt8(74);
        this.SerialNumber = common_1.readZString(this.Data.slice(75, 83));
        this.OperatingState = this.Data.readUInt8(83);
        this.CurrentPosition = this.Data.readUInt16BE(84);
        this.TargetPosition = this.Data.readUInt16BE(86);
        this.FunctionalPosition1CurrentPosition = this.Data.readUInt16BE(88);
        this.FunctionalPosition2CurrentPosition = this.Data.readUInt16BE(90);
        this.FunctionalPosition3CurrentPosition = this.Data.readUInt16BE(92);
        this.FunctionalPosition4CurrentPosition = this.Data.readUInt16BE(94);
        this.RemainingTime = this.Data.readUInt16BE(96);
        this.TimeStamp = new Date(this.Data.readUInt32BE(98) * 1000);
        // Read actuator aliases
        const numberOfAliases = this.Data.readUInt8(102);
        for (let index = 0; index < numberOfAliases; index++) {
            const alias = new GW_SYSTEMTABLE_DATA_1.ActuatorAlias(this.Data.readUInt16BE(index * 4 + 103), this.Data.readUInt16BE(index * 4 + 104));
            this.ActuatorAliases.push(alias);
        }
    }
}
exports.GW_GET_ALL_NODES_INFORMATION_NTF = GW_GET_ALL_NODES_INFORMATION_NTF;
//# sourceMappingURL=GW_GET_ALL_NODES_INFORMATION_NTF.js.map