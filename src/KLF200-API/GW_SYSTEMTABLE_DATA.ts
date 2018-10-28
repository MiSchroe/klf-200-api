'use strict';

export enum ActuatorType {
    VenetianBlind = 1,
    RollerShutter = 2,
    Awning = 3,
    WindowOpener = 4,
    GarageOpener = 5,
    Light = 6,
    GateOpener = 7,
    RollingDoorOpener = 8,
    Lock = 9,
    Blind = 10,
    Beacon = 12,
    DualShutter = 13,
    HeatingTemperatureInterface = 14,
    OnOffSwitch = 15,
    HorizontalAwning = 16,
    ExternalVentianBlind = 17,
    LouvreBlind = 18,
    CurtainTrack = 19,
    VentilationPoint = 20,
    ExteriorHeating = 21,
    HeatPump = 22,
    IntrusionAlarm = 23,
    SwingingShutter = 24
}

export enum PowerSaveMode {
    AlwaysAlive = 0,
    LowPowerMode = 1
}

export enum Manufacturer {
    VELUX = 1,
    Somfy = 2,
    Honeywell = 3,
    Hoermann = 4,
    ASSA_ABLOY = 5,
    Niko = 6,
    WINDOW_MASTER = 7,
    Renson = 8,
    CIAT = 9,
    Secuyou = 10,
    OVERKIZ = 11,
    Atlantic_Group = 12
}

export class SystemTableDataEntry {
    constructor(data: Buffer) {
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

    readonly Data: Buffer;
    readonly SystemTableIndex: number;
    readonly ActuatorAddress: number;
    readonly ActuatorType: ActuatorType;
    readonly ActuatorSubType: number;
    readonly PowerSaveMode: PowerSaveMode;
    readonly ioMembership: boolean;
    readonly RFSupport: boolean;
    readonly ActuatorTurnaroundTime: number;
    readonly Manufacturer: Manufacturer;
    readonly BackboneReferenceNumber: number;
}