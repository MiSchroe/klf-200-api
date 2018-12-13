import { ActuatorType } from "./GW_SYSTEMTABLE_DATA";

'use strict';

export enum CommandOriginator {
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

export enum PriorityLevel {
    HumanProtection = 0,
    EnvironmentProtection = 1,
    UserLevel1 = 2,
    UserLevel2 = 3,
    ComfortLevel1 = 4,
    ComfortLevel2 = 5,
    ComfortLevel3 = 6,
    ComfortLevel4 = 7,
}

export enum ParameterActive {
    MP = 0,
    FP1,
    FP2,
    FP3,
    FP4,
    FP5,
    FP6,
    FP7,
    FP8,
    FP9,
    FP10,
    FP11,
    FP12,
    FP13,
    FP14,
    FP15,
    FP16
}

export enum PriorityLevelLock {
    DoNotUsePriorityLevelLock = 0,
    UsePriorityLevelLock = 1
}

export enum PriorityLevelInformation {
    Disable = 0,
    Enable = 1,
    EnableAll = 2,
    KeepCurrent = 3
}

export class LockTime {
    static lockTimeValueToLockTime(lockTimeValue: number): number {
        // Check parameter range
        if (lockTimeValue < 0 || lockTimeValue > 255)
            throw new Error("Lock time value out of range.");

        return lockTimeValue === 255 ? Infinity : lockTimeValue * 30 + 30;
    }

    static lockTimeTolockTimeValue(lockTime: number): number {
        if (lockTime === Infinity)
            return 255;

        if ((lockTime % 30) !== 0)
            throw new Error("Lock time must be a multiple of 30.");

        if (lockTime < 0 || lockTime > 7560)
            throw new Error("Lock time out of range.");

        return lockTime / 30 - 1;
    }
}

export enum CommandStatus {
    CommandRejected = 0,
    CommandAccepted = 1
}

export enum StatusOwner {
    LocalUser = 0x00,
    User = 0x01,
    Rain = 0x02,
    Timer = 0x03,
    UPS = 0x05,
    Program = 0x08,
    Wind = 0x09,
    Myself = 0x0a,
    AutomaticCycle = 0x0b,
    Emergency = 0x0c,
    Unknown = 0xff
}

export enum RunStatus {
    ExecutionCompleted = 0,
    ExecutionFailed = 1,
    ExecutionActive = 2
}

export enum StatusReply {
    Unknown = 0x00,
    Ok = 0x01,
    NoContact = 0x02,
    ManuallyOperated = 0x03,
    Blocked = 0x04,
    WrongSystemKey = 0x05,
    PriorityLevelLocked = 0x06,
    ReachedWrongPosition = 0x07,
    ErrorDuringExecution = 0x08,
    NoExecution = 0x09,
    Calibrating = 0x0a,
    PowerConsumptionTooHigh = 0x0b,
    PowerConsumptionTooLow = 0x0c,
    LockPositionOpen = 0x0d,
    MotionTimeTooLongCommunicationEnded = 0x0e,
    ThermalProtection = 0x0f,
    ProductNotOperational = 0x10,
    FilterMaintenanceNeeded = 0x11,
    BatteryLevel = 0x12,
    TargetModified = 0x13,
    ModeNotImplemented = 0x14,
    CommandIncompatibleToMovement = 0x15,
    UserAction = 0x16,
    DeadBoltError = 0x17,
    AutomaticCycleEngaged = 0x18,
    WrongLoadConnected = 0x19,
    ColourNotReachable = 0x1a,
    TargetNotReachable = 0x1b,
    BadIndexReceived = 0x1c,
    CommandOverruled = 0x1d,
    NodeWaitingForPower = 0x1e,
    InformationCode = 0xdf,
    ParameterLimited = 0xe0,
    LimitationByLocalUser = 0xe1,
    LimitationByUser = 0xe2,
    LimitationByRain = 0xe3,
    LimitationByTimer = 0xe4,
    LimitationByUps = 0xe6,
    LimitationByUnknownDevice = 0xe7,
    LimitationBySAAC = 0xea,
    LimitationByWind = 0xeb,
    LimitationByMyself = 0xec,
    LimitationByAutomaticCycle = 0xed,
    LimitationByEmergency = 0xee
}

export enum StatusType {
    RequestTargetPosition = 0,
    RequestCurrentPosition = 1,
    RequestRemainingTime = 2,
    RequestMainInfo = 3
}

let sessionID = 0;

export function getNextSessionID(): number {
    return sessionID++ & 0xFFFF;
}

export type FunctionalParameter = {
    ID: number,
    Value: number
}

export enum LimitationType {
    MinimumLimitation = 0,
    MaximumLimitation = 1
}

export enum ModeStatus {
    OK = 0,
    CommandRejected,
    UnknownClientID,
    SessionIDInUse,
    Busy,
    IllegalParameterValue,
    Failed = 255
}

export enum ActivateProductGroupStatus {
    OK = 0,
    UnknownProductGroup,
    SessionIDInUse,
    Busy,
    WrongGroupType,
    Failed,
    InvalidParameterUsed
}

const InverseProductTypes = [
    ActuatorType.WindowOpener,
    ActuatorType.Light,
    ActuatorType.OnOffSwitch,
    ActuatorType.VentilationPoint,
    ActuatorType.ExteriorHeating
];

export function convertPositionRaw(positionRaw: number, typeID: ActuatorType): number {
    if (positionRaw > 0xC800) {
        return NaN; // Can't calculate the current position
    }

    let result = positionRaw / 0xC800;
    if (InverseProductTypes.indexOf(typeID) !== -1) {
        // Percentage has to be calculated reverse
        result = 1 - result;
    }

    return result;
}

export function convertPosition(position: number, typeID: ActuatorType): number {
    if (position < 0 || position > 1)
        throw new Error("Position value out of range.");

    if (InverseProductTypes.indexOf(typeID) !== -1) {
        // Percentage has to be calculated reverse
        position = 1 - position;
    }
    return Math.round(0xC800 * position);
}

