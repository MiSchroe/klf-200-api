'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var CommandOriginator;
(function (CommandOriginator) {
    CommandOriginator[CommandOriginator["User"] = 1] = "User";
    CommandOriginator[CommandOriginator["Rain"] = 2] = "Rain";
    CommandOriginator[CommandOriginator["Timer"] = 3] = "Timer";
    CommandOriginator[CommandOriginator["UPS"] = 5] = "UPS";
    CommandOriginator[CommandOriginator["SAAC"] = 8] = "SAAC";
    CommandOriginator[CommandOriginator["Wind"] = 9] = "Wind";
    CommandOriginator[CommandOriginator["LoadShedding"] = 11] = "LoadShedding";
    CommandOriginator[CommandOriginator["LocalLight"] = 12] = "LocalLight";
    CommandOriginator[CommandOriginator["UnspecificEnvironmentSensor"] = 13] = "UnspecificEnvironmentSensor";
    CommandOriginator[CommandOriginator["Emergency"] = 255] = "Emergency";
})(CommandOriginator = exports.CommandOriginator || (exports.CommandOriginator = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel[PriorityLevel["HumanProtection"] = 0] = "HumanProtection";
    PriorityLevel[PriorityLevel["EnvironmentProtection"] = 1] = "EnvironmentProtection";
    PriorityLevel[PriorityLevel["UserLevel1"] = 2] = "UserLevel1";
    PriorityLevel[PriorityLevel["UserLevel2"] = 3] = "UserLevel2";
    PriorityLevel[PriorityLevel["ComfortLevel1"] = 4] = "ComfortLevel1";
    PriorityLevel[PriorityLevel["ComfortLevel2"] = 5] = "ComfortLevel2";
    PriorityLevel[PriorityLevel["ComfortLevel3"] = 6] = "ComfortLevel3";
    PriorityLevel[PriorityLevel["ComfortLevel4"] = 7] = "ComfortLevel4";
})(PriorityLevel = exports.PriorityLevel || (exports.PriorityLevel = {}));
var ParameterActive;
(function (ParameterActive) {
    ParameterActive[ParameterActive["MP"] = 0] = "MP";
    ParameterActive[ParameterActive["FP1"] = 1] = "FP1";
    ParameterActive[ParameterActive["FP2"] = 2] = "FP2";
    ParameterActive[ParameterActive["FP3"] = 3] = "FP3";
    ParameterActive[ParameterActive["FP4"] = 4] = "FP4";
    ParameterActive[ParameterActive["FP5"] = 5] = "FP5";
    ParameterActive[ParameterActive["FP6"] = 6] = "FP6";
    ParameterActive[ParameterActive["FP7"] = 7] = "FP7";
    ParameterActive[ParameterActive["FP8"] = 8] = "FP8";
    ParameterActive[ParameterActive["FP9"] = 9] = "FP9";
    ParameterActive[ParameterActive["FP10"] = 10] = "FP10";
    ParameterActive[ParameterActive["FP11"] = 11] = "FP11";
    ParameterActive[ParameterActive["FP12"] = 12] = "FP12";
    ParameterActive[ParameterActive["FP13"] = 13] = "FP13";
    ParameterActive[ParameterActive["FP14"] = 14] = "FP14";
    ParameterActive[ParameterActive["FP15"] = 15] = "FP15";
    ParameterActive[ParameterActive["FP16"] = 16] = "FP16";
})(ParameterActive = exports.ParameterActive || (exports.ParameterActive = {}));
var PriorityLevelLock;
(function (PriorityLevelLock) {
    PriorityLevelLock[PriorityLevelLock["DoNotUsePriorityLevelLock"] = 0] = "DoNotUsePriorityLevelLock";
    PriorityLevelLock[PriorityLevelLock["UsePriorityLevelLock"] = 1] = "UsePriorityLevelLock";
})(PriorityLevelLock = exports.PriorityLevelLock || (exports.PriorityLevelLock = {}));
(function (PriorityLevel) {
    PriorityLevel[PriorityLevel["Disable"] = 0] = "Disable";
    PriorityLevel[PriorityLevel["Enable"] = 1] = "Enable";
    PriorityLevel[PriorityLevel["EnableAll"] = 2] = "EnableAll";
    PriorityLevel[PriorityLevel["KeepCurrent"] = 3] = "KeepCurrent";
})(PriorityLevel = exports.PriorityLevel || (exports.PriorityLevel = {}));
class LockTime {
    static lockTimeValueToLockTime(lockTimeValue) {
        // Check parameter range
        if (lockTimeValue < 0 || lockTimeValue > 255)
            throw "Lock time value out of range.";
        return lockTimeValue === 255 ? Infinity : lockTimeValue * 30 + 30;
    }
    static lockTimeTolockTimeValue(lockTime) {
        if (lockTime === Infinity)
            return 255;
        if ((lockTime % 30) !== 0)
            throw "Lock time must be a multiple of 30.";
        if (lockTime < 0 || lockTime > 7560)
            throw "Lock time out of range.";
        return lockTime / 30 - 1;
    }
}
exports.LockTime = LockTime;
var CommandStatus;
(function (CommandStatus) {
    CommandStatus[CommandStatus["CommandRejected"] = 0] = "CommandRejected";
    CommandStatus[CommandStatus["CommandAccepted"] = 1] = "CommandAccepted";
})(CommandStatus = exports.CommandStatus || (exports.CommandStatus = {}));
var StatusOwner;
(function (StatusOwner) {
    StatusOwner[StatusOwner["LocalUser"] = 0] = "LocalUser";
    StatusOwner[StatusOwner["User"] = 1] = "User";
    StatusOwner[StatusOwner["Rain"] = 2] = "Rain";
    StatusOwner[StatusOwner["Timer"] = 3] = "Timer";
    StatusOwner[StatusOwner["UPS"] = 5] = "UPS";
    StatusOwner[StatusOwner["Program"] = 8] = "Program";
    StatusOwner[StatusOwner["Wind"] = 9] = "Wind";
    StatusOwner[StatusOwner["Myself"] = 10] = "Myself";
    StatusOwner[StatusOwner["AutomaticCycle"] = 11] = "AutomaticCycle";
    StatusOwner[StatusOwner["Emergency"] = 12] = "Emergency";
    StatusOwner[StatusOwner["Unknown"] = 255] = "Unknown";
})(StatusOwner = exports.StatusOwner || (exports.StatusOwner = {}));
var RunStatus;
(function (RunStatus) {
    RunStatus[RunStatus["ExecutionCompleted"] = 0] = "ExecutionCompleted";
    RunStatus[RunStatus["ExecutionFailed"] = 1] = "ExecutionFailed";
    RunStatus[RunStatus["ExecutionActive"] = 2] = "ExecutionActive";
})(RunStatus = exports.RunStatus || (exports.RunStatus = {}));
var StatusReply;
(function (StatusReply) {
    StatusReply[StatusReply["Unknown"] = 0] = "Unknown";
    StatusReply[StatusReply["Ok"] = 1] = "Ok";
    StatusReply[StatusReply["NoContact"] = 2] = "NoContact";
    StatusReply[StatusReply["ManuallyOperated"] = 3] = "ManuallyOperated";
    StatusReply[StatusReply["Blocked"] = 4] = "Blocked";
    StatusReply[StatusReply["WrongSystemKey"] = 5] = "WrongSystemKey";
    StatusReply[StatusReply["PriorityLevelLocked"] = 6] = "PriorityLevelLocked";
    StatusReply[StatusReply["ReachedWrongPosition"] = 7] = "ReachedWrongPosition";
    StatusReply[StatusReply["ErrorDuringExecution"] = 8] = "ErrorDuringExecution";
    StatusReply[StatusReply["NoExecution"] = 9] = "NoExecution";
    StatusReply[StatusReply["Calibrating"] = 10] = "Calibrating";
    StatusReply[StatusReply["PowerConsumptionTooHigh"] = 11] = "PowerConsumptionTooHigh";
    StatusReply[StatusReply["PowerConsumptionTooLow"] = 12] = "PowerConsumptionTooLow";
    StatusReply[StatusReply["LockPositionOpen"] = 13] = "LockPositionOpen";
    StatusReply[StatusReply["MotionTimeTooLongCommunicationEnded"] = 14] = "MotionTimeTooLongCommunicationEnded";
    StatusReply[StatusReply["ThermalProtection"] = 15] = "ThermalProtection";
    StatusReply[StatusReply["ProductNotOperational"] = 16] = "ProductNotOperational";
    StatusReply[StatusReply["FilterMaintenanceNeeded"] = 17] = "FilterMaintenanceNeeded";
    StatusReply[StatusReply["BatteryLevel"] = 18] = "BatteryLevel";
    StatusReply[StatusReply["TargetModified"] = 19] = "TargetModified";
    StatusReply[StatusReply["ModeNotImplemented"] = 20] = "ModeNotImplemented";
    StatusReply[StatusReply["CommandIncompatibleToMovement"] = 21] = "CommandIncompatibleToMovement";
    StatusReply[StatusReply["UserAction"] = 22] = "UserAction";
    StatusReply[StatusReply["DeadBoltError"] = 23] = "DeadBoltError";
    StatusReply[StatusReply["AutomaticCycleEngaged"] = 24] = "AutomaticCycleEngaged";
    StatusReply[StatusReply["WrongLoadConnected"] = 25] = "WrongLoadConnected";
    StatusReply[StatusReply["ColourNotReachable"] = 26] = "ColourNotReachable";
    StatusReply[StatusReply["TargetNotReachable"] = 27] = "TargetNotReachable";
    StatusReply[StatusReply["BadIndexReceived"] = 28] = "BadIndexReceived";
    StatusReply[StatusReply["CommandOverruled"] = 29] = "CommandOverruled";
    StatusReply[StatusReply["NodeWaitingForPower"] = 30] = "NodeWaitingForPower";
    StatusReply[StatusReply["InformationCode"] = 223] = "InformationCode";
    StatusReply[StatusReply["ParameterLimited"] = 224] = "ParameterLimited";
    StatusReply[StatusReply["LimitationByLocalUser"] = 225] = "LimitationByLocalUser";
    StatusReply[StatusReply["LimitationByUser"] = 226] = "LimitationByUser";
    StatusReply[StatusReply["LimitationByRain"] = 227] = "LimitationByRain";
    StatusReply[StatusReply["LimitationByTimer"] = 228] = "LimitationByTimer";
    StatusReply[StatusReply["LimitationByUps"] = 230] = "LimitationByUps";
    StatusReply[StatusReply["LimitationByUnknownDevice"] = 231] = "LimitationByUnknownDevice";
    StatusReply[StatusReply["LimitationBySAAC"] = 234] = "LimitationBySAAC";
    StatusReply[StatusReply["LimitationByWind"] = 235] = "LimitationByWind";
    StatusReply[StatusReply["LimitationByMyself"] = 236] = "LimitationByMyself";
    StatusReply[StatusReply["LimitationByAutomaticCycle"] = 237] = "LimitationByAutomaticCycle";
    StatusReply[StatusReply["LimitationByEmergency"] = 238] = "LimitationByEmergency";
})(StatusReply = exports.StatusReply || (exports.StatusReply = {}));
var StatusType;
(function (StatusType) {
    StatusType[StatusType["RequestTargetPosition"] = 0] = "RequestTargetPosition";
    StatusType[StatusType["RequestCurrentPosition"] = 1] = "RequestCurrentPosition";
    StatusType[StatusType["RequestRemainingTime"] = 2] = "RequestRemainingTime";
    StatusType[StatusType["RequestMainInfo"] = 3] = "RequestMainInfo";
})(StatusType = exports.StatusType || (exports.StatusType = {}));
let sessionID = 0;
function getNextSessionID() {
    return sessionID++ & 0xFFFF;
}
exports.getNextSessionID = getNextSessionID;
//# sourceMappingURL=GW_COMMAND.js.map