export declare enum ActuatorType {
    NO_TYPE = 0,
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
export declare function splitActuatorType(value: number): {
    ActuatorType: ActuatorType;
    ActuatorSubType: number;
};
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
export declare enum Velocity {
    Default = 0,
    Silent = 1,
    Fast = 2,
    NotAvailable = 255
}
export declare enum NodeVariation {
    NotSet = 0,
    TopHung = 1,
    Kip = 2,
    FlatRoof = 3,
    SkyLight = 4
}
export declare enum NodeOperatingState {
    NonExecuting = 0,
    Error = 1,
    NotUsed = 2,
    WaitingForPower = 3,
    Executing = 4,
    Done = 5,
    Unknown = 255
}
export declare class ActuatorAlias {
    readonly AliasType: number;
    readonly AliasValue: number;
    constructor(AliasType: number, AliasValue: number);
}
export declare enum ControllerCopyMode {
    TransmittingConfigurationMode = 0,
    ReceivingConfigurationMode = 1
}
export declare enum ChangeKeyStatus {
    OK_KeyChangeClientController = 0,
    OK_AllNodesUpdated = 2,
    OK_PartialNodesUpdated = 3,
    OK_ClientControllerReceivedKey = 5,
    Failed_LocalStimuliNotDisabled = 7,
    Failed_NoControllerFound = 9,
    Failed_DTSNotReady = 10,
    Failed_DTSError = 11,
    Failed_CSNotReady = 16
}
