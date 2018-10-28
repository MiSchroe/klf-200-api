'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var ActuatorType;
(function (ActuatorType) {
    ActuatorType[ActuatorType["VenetianBlind"] = 1] = "VenetianBlind";
    ActuatorType[ActuatorType["RollerShutter"] = 2] = "RollerShutter";
    ActuatorType[ActuatorType["Awning"] = 3] = "Awning";
    ActuatorType[ActuatorType["WindowOpener"] = 4] = "WindowOpener";
    ActuatorType[ActuatorType["GarageOpener"] = 5] = "GarageOpener";
    ActuatorType[ActuatorType["Light"] = 6] = "Light";
    ActuatorType[ActuatorType["GateOpener"] = 7] = "GateOpener";
    ActuatorType[ActuatorType["RollingDoorOpener"] = 8] = "RollingDoorOpener";
    ActuatorType[ActuatorType["Lock"] = 9] = "Lock";
    ActuatorType[ActuatorType["Blind"] = 10] = "Blind";
    ActuatorType[ActuatorType["Beacon"] = 12] = "Beacon";
    ActuatorType[ActuatorType["DualShutter"] = 13] = "DualShutter";
    ActuatorType[ActuatorType["HeatingTemperatureInterface"] = 14] = "HeatingTemperatureInterface";
    ActuatorType[ActuatorType["OnOffSwitch"] = 15] = "OnOffSwitch";
    ActuatorType[ActuatorType["HorizontalAwning"] = 16] = "HorizontalAwning";
    ActuatorType[ActuatorType["ExternalVentianBlind"] = 17] = "ExternalVentianBlind";
    ActuatorType[ActuatorType["LouvreBlind"] = 18] = "LouvreBlind";
    ActuatorType[ActuatorType["CurtainTrack"] = 19] = "CurtainTrack";
    ActuatorType[ActuatorType["VentilationPoint"] = 20] = "VentilationPoint";
    ActuatorType[ActuatorType["ExteriorHeating"] = 21] = "ExteriorHeating";
    ActuatorType[ActuatorType["HeatPump"] = 22] = "HeatPump";
    ActuatorType[ActuatorType["IntrusionAlarm"] = 23] = "IntrusionAlarm";
    ActuatorType[ActuatorType["SwingingShutter"] = 24] = "SwingingShutter";
})(ActuatorType = exports.ActuatorType || (exports.ActuatorType = {}));
var PowerSaveMode;
(function (PowerSaveMode) {
    PowerSaveMode[PowerSaveMode["AlwaysAlive"] = 0] = "AlwaysAlive";
    PowerSaveMode[PowerSaveMode["LowPowerMode"] = 1] = "LowPowerMode";
})(PowerSaveMode = exports.PowerSaveMode || (exports.PowerSaveMode = {}));
var Manufacturer;
(function (Manufacturer) {
    Manufacturer[Manufacturer["VELUX"] = 1] = "VELUX";
    Manufacturer[Manufacturer["Somfy"] = 2] = "Somfy";
    Manufacturer[Manufacturer["Honeywell"] = 3] = "Honeywell";
    Manufacturer[Manufacturer["Hoermann"] = 4] = "Hoermann";
    Manufacturer[Manufacturer["ASSA_ABLOY"] = 5] = "ASSA_ABLOY";
    Manufacturer[Manufacturer["Niko"] = 6] = "Niko";
    Manufacturer[Manufacturer["WINDOW_MASTER"] = 7] = "WINDOW_MASTER";
    Manufacturer[Manufacturer["Renson"] = 8] = "Renson";
    Manufacturer[Manufacturer["CIAT"] = 9] = "CIAT";
    Manufacturer[Manufacturer["Secuyou"] = 10] = "Secuyou";
    Manufacturer[Manufacturer["OVERKIZ"] = 11] = "OVERKIZ";
    Manufacturer[Manufacturer["Atlantic_Group"] = 12] = "Atlantic_Group";
})(Manufacturer = exports.Manufacturer || (exports.Manufacturer = {}));
class SystemTableDataEntry {
    constructor(data) {
        this.Data = data;
        this.SystemTableIndex = data.readUInt8(0);
        this.ActuatorAddress = data.readUInt8(1) * 65536 + data.readUInt8(2) * 256 + data.readUInt8(3);
        this.ActuatorType = data.readUInt16BE(4) >>> 5;
        this.ActuatorSubType = data.readUInt8(5) && 0x3F;
        const byte6 = data.readUInt8(6);
        this.PowerSaveMode = byte6 && 0x03;
        this.ioMembership = (byte6 & 0x04) === 0x04;
        this.RFSupport = (byte6 & 0x08) === 0x08;
        switch (byte6 >>> 6) {
            case 0:
                this.ActuatorTurnaroundTime = 5;
                break;
            case 1:
                this.ActuatorTurnaroundTime = 10;
                break;
            case 2:
                this.ActuatorTurnaroundTime = 20;
                break;
            case 3:
                this.ActuatorTurnaroundTime = 40;
                break;
            default:
                throw "Invalid actuator turn-around time.";
        }
        this.Manufacturer = data.readUInt8(7);
        this.BackboneReferenceNumber = data.readUInt8(8) * 65536 + data.readUInt8(9) * 256 + data.readUInt8(10);
    }
}
exports.SystemTableDataEntry = SystemTableDataEntry;
//# sourceMappingURL=GW_SYSTEMTABLE_DATA.js.map