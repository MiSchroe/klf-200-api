/// <reference types="node" />
export declare enum ActuatorType {
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
export declare enum PowerSaveMode {
    AlwaysAlive = 0,
    LowPowerMode = 1
}
export declare enum Manufacturer {
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
export declare class SystemTableDataEntry {
    constructor(data: Buffer);
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
