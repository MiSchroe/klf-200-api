"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActuatorType;
(function (ActuatorType) {
    ActuatorType[ActuatorType["NO_TYPE"] = 0] = "NO_TYPE";
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
function splitActuatorType(value) {
    return { ActuatorType: (value >>> 6), ActuatorSubType: value & 0x3F };
}
exports.splitActuatorType = splitActuatorType;
class SystemTableDataEntry {
    constructor(data) {
        this.Data = data;
        this.SystemTableIndex = data.readUInt8(0);
        this.ActuatorAddress = data.readUInt8(1) * 65536 + data.readUInt8(2) * 256 + data.readUInt8(3);
        this.ActuatorType = data.readUInt16BE(4) >>> 6;
        this.ActuatorSubType = data.readUInt8(5) & 0x3F;
        const byte6 = data.readUInt8(6);
        this.PowerSaveMode = byte6 & 0x03;
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
                throw new Error("Invalid actuator turn-around time.");
        }
        this.Manufacturer = data.readUInt8(7);
        this.BackboneReferenceNumber = data.readUInt8(8) * 65536 + data.readUInt8(9) * 256 + data.readUInt8(10);
    }
}
exports.SystemTableDataEntry = SystemTableDataEntry;
var Velocity;
(function (Velocity) {
    Velocity[Velocity["Default"] = 0] = "Default";
    Velocity[Velocity["Silent"] = 1] = "Silent";
    Velocity[Velocity["Fast"] = 2] = "Fast";
    Velocity[Velocity["NotAvailable"] = 255] = "NotAvailable";
})(Velocity = exports.Velocity || (exports.Velocity = {}));
var NodeVariation;
(function (NodeVariation) {
    NodeVariation[NodeVariation["NotSet"] = 0] = "NotSet";
    NodeVariation[NodeVariation["TopHung"] = 1] = "TopHung";
    NodeVariation[NodeVariation["Kip"] = 2] = "Kip";
    NodeVariation[NodeVariation["FlatRoof"] = 3] = "FlatRoof";
    NodeVariation[NodeVariation["SkyLight"] = 4] = "SkyLight";
})(NodeVariation = exports.NodeVariation || (exports.NodeVariation = {}));
var NodeOperatingState;
(function (NodeOperatingState) {
    NodeOperatingState[NodeOperatingState["NonExecuting"] = 0] = "NonExecuting";
    NodeOperatingState[NodeOperatingState["Error"] = 1] = "Error";
    NodeOperatingState[NodeOperatingState["NotUsed"] = 2] = "NotUsed";
    NodeOperatingState[NodeOperatingState["WaitingForPower"] = 3] = "WaitingForPower";
    NodeOperatingState[NodeOperatingState["Executing"] = 4] = "Executing";
    NodeOperatingState[NodeOperatingState["Done"] = 5] = "Done";
    NodeOperatingState[NodeOperatingState["Unknown"] = 255] = "Unknown";
})(NodeOperatingState = exports.NodeOperatingState || (exports.NodeOperatingState = {}));
class ActuatorAlias {
    constructor(AliasType, AliasValue) {
        this.AliasType = AliasType;
        this.AliasValue = AliasValue;
    }
}
exports.ActuatorAlias = ActuatorAlias;
var ControllerCopyMode;
(function (ControllerCopyMode) {
    ControllerCopyMode[ControllerCopyMode["TransmittingConfigurationMode"] = 0] = "TransmittingConfigurationMode";
    ControllerCopyMode[ControllerCopyMode["ReceivingConfigurationMode"] = 1] = "ReceivingConfigurationMode";
})(ControllerCopyMode = exports.ControllerCopyMode || (exports.ControllerCopyMode = {}));
var ChangeKeyStatus;
(function (ChangeKeyStatus) {
    ChangeKeyStatus[ChangeKeyStatus["OK_KeyChangeClientController"] = 0] = "OK_KeyChangeClientController";
    ChangeKeyStatus[ChangeKeyStatus["OK_AllNodesUpdated"] = 2] = "OK_AllNodesUpdated";
    ChangeKeyStatus[ChangeKeyStatus["OK_PartialNodesUpdated"] = 3] = "OK_PartialNodesUpdated";
    ChangeKeyStatus[ChangeKeyStatus["OK_ClientControllerReceivedKey"] = 5] = "OK_ClientControllerReceivedKey";
    ChangeKeyStatus[ChangeKeyStatus["Failed_LocalStimuliNotDisabled"] = 7] = "Failed_LocalStimuliNotDisabled";
    ChangeKeyStatus[ChangeKeyStatus["Failed_NoControllerFound"] = 9] = "Failed_NoControllerFound";
    ChangeKeyStatus[ChangeKeyStatus["Failed_DTSNotReady"] = 10] = "Failed_DTSNotReady";
    ChangeKeyStatus[ChangeKeyStatus["Failed_DTSError"] = 11] = "Failed_DTSError";
    ChangeKeyStatus[ChangeKeyStatus["Failed_CSNotReady"] = 16] = "Failed_CSNotReady";
})(ChangeKeyStatus = exports.ChangeKeyStatus || (exports.ChangeKeyStatus = {}));
//# sourceMappingURL=GW_SYSTEMTABLE_DATA.js.map