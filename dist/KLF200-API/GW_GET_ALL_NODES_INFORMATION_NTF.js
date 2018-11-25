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
        this.SerialNumber = this.Data.slice(75, 83);
        this.OperatingState = this.Data.readUInt8(84);
        this.CurrentPosition = this.Data.readUInt16BE(85);
        this.TargetPosition = this.Data.readUInt16BE(87);
        this.FunctionalPosition1CurrentPosition = this.Data.readUInt16BE(89);
        this.FunctionalPosition2CurrentPosition = this.Data.readUInt16BE(91);
        this.FunctionalPosition3CurrentPosition = this.Data.readUInt16BE(93);
        this.FunctionalPosition4CurrentPosition = this.Data.readUInt16BE(95);
        this.RemainingTime = this.Data.readUInt16BE(97);
        this.TimeStamp = new Date(this.Data.readUInt32BE(99) * 1000);
        // Read actuator aliases
        const numberOfAliases = this.Data.readUInt8(103);
        for (let index = 0; index < numberOfAliases; index++) {
            const alias = new GW_SYSTEMTABLE_DATA_1.ActuatorAlias(this.Data.readUInt16BE(index * 4 + 104), this.Data.readUInt16BE(index * 4 + 106));
            this.ActuatorAliases.push(alias);
        }
    }
}
exports.GW_GET_ALL_NODES_INFORMATION_NTF = GW_GET_ALL_NODES_INFORMATION_NTF;
