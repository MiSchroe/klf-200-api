export declare enum CommandOriginator {
    User = 1,
    Rain = 2,
    Timer = 3,
    UPS = 5,
    SAAC = 8,
    Wind = 9,
    LoadShedding = 11,
    LocalLight = 12,
    UnspecificEnvironmentSensor = 13,
    Emergency = 255
}
export declare enum PriorityLevel {
    HumanProtection = 0,
    EnvironmentProtection = 1,
    UserLevel1 = 2,
    UserLevel2 = 3,
    ComfortLevel1 = 4,
    ComfortLevel2 = 5,
    ComfortLevel3 = 6,
    ComfortLevel4 = 7
}
export declare enum ParameterActive {
    MP = 0,
    FP1 = 1,
    FP2 = 2,
    FP3 = 3,
    FP4 = 4,
    FP5 = 5,
    FP6 = 6,
    FP7 = 7,
    FP8 = 8,
    FP9 = 9,
    FP10 = 10,
    FP11 = 11,
    FP12 = 12,
    FP13 = 13,
    FP14 = 14,
    FP15 = 15,
    FP16 = 16
}
export declare enum PriorityLevelLock {
    DoNotUsePriorityLevelLock = 0,
    UsePriorityLevelLock = 1
}
export declare enum PriorityLevel {
    Disable = 0,
    Enable = 1,
    EnableAll = 2,
    KeepCurrent = 3
}
export declare class LockTime {
    static lockTimeValueToLockTime(lockTimeValue: number): number;
    static lockTimeTolockTimeValue(lockTime: number): number;
}
export declare enum CommandStatus {
    CommandRejected = 0,
    CommandAccepted = 1
}
export declare enum StatusOwner {
    LocalUser = 0,
    User = 1,
    Rain = 2,
    Timer = 3,
    UPS = 5,
    Program = 8,
    Wind = 9,
    Myself = 10,
    AutomaticCycle = 11,
    Emergency = 12,
    Unknown = 255
}
export declare enum RunStatus {
    ExecutionCompleted = 0,
    ExecutionFailed = 1,
    ExecutionActive = 2
}
export declare enum StatusReply {
    Unknown = 0,
    Ok = 1,
    NoContact = 2,
    ManuallyOperated = 3,
    Blocked = 4,
    WrongSystemKey = 5,
    PriorityLevelLocked = 6,
    ReachedWrongPosition = 7,
    ErrorDuringExecution = 8,
    NoExecution = 9,
    Calibrating = 10,
    PowerConsumptionTooHigh = 11,
    PowerConsumptionTooLow = 12,
    LockPositionOpen = 13,
    MotionTimeTooLongCommunicationEnded = 14,
    ThermalProtection = 15,
    ProductNotOperational = 16,
    FilterMaintenanceNeeded = 17,
    BatteryLevel = 18,
    TargetModified = 19,
    ModeNotImplemented = 20,
    CommandIncompatibleToMovement = 21,
    UserAction = 22,
    DeadBoltError = 23,
    AutomaticCycleEngaged = 24,
    WrongLoadConnected = 25,
    ColourNotReachable = 26,
    TargetNotReachable = 27,
    BadIndexReceived = 28,
    CommandOverruled = 29,
    NodeWaitingForPower = 30,
    InformationCode = 223,
    ParameterLimited = 224,
    LimitationByLocalUser = 225,
    LimitationByUser = 226,
    LimitationByRain = 227,
    LimitationByTimer = 228,
    LimitationByUps = 230,
    LimitationByUnknownDevice = 231,
    LimitationBySAAC = 234,
    LimitationByWind = 235,
    LimitationByMyself = 236,
    LimitationByAutomaticCycle = 237,
    LimitationByEmergency = 238
}
export declare enum StatusType {
    RequestTargetPosition = 0,
    RequestCurrentPosition = 1,
    RequestRemainingTime = 2,
    RequestMainInfo = 3
}
export declare function getNextSessionID(): number;
export declare type FunctionalParameter = {
    ID: number;
    Value: number;
};
export declare enum LimitationType {
    MinimumLimitation = 0,
    MaximumLimitation = 1
}
export declare enum ModeStatus {
    OK = 0,
    CommandRejected = 1,
    UnknownClientID = 2,
    sessionIDInUse = 3,
    Busy = 4,
    IllegalParameterValue = 5,
    Failed = 255
}
