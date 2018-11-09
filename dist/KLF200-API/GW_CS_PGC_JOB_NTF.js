'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
var PGCJobState;
(function (PGCJobState) {
    PGCJobState[PGCJobState["PGCJobStarted"] = 0] = "PGCJobStarted";
    PGCJobState[PGCJobState["PGCJobEnded"] = 1] = "PGCJobEnded";
    PGCJobState[PGCJobState["CSBusy"] = 2] = "CSBusy";
})(PGCJobState = exports.PGCJobState || (exports.PGCJobState = {}));
var PGCJobStatus;
(function (PGCJobStatus) {
    PGCJobStatus[PGCJobStatus["OK"] = 0] = "OK";
    PGCJobStatus[PGCJobStatus["PartialOK"] = 1] = "PartialOK";
    PGCJobStatus[PGCJobStatus["Failed_JobError"] = 2] = "Failed_JobError";
    PGCJobStatus[PGCJobStatus["Failed_CancelledOrTooLongKeyPress"] = 3] = "Failed_CancelledOrTooLongKeyPress";
})(PGCJobStatus = exports.PGCJobStatus || (exports.PGCJobStatus = {}));
var PGCJobType;
(function (PGCJobType) {
    PGCJobType[PGCJobType["ReceiveSystemCopy"] = 0] = "ReceiveSystemCopy";
    PGCJobType[PGCJobType["ReceiveKey"] = 1] = "ReceiveKey";
    PGCJobType[PGCJobType["TransmitKey"] = 2] = "TransmitKey";
    PGCJobType[PGCJobType["GenerateKey"] = 3] = "GenerateKey";
})(PGCJobType = exports.PGCJobType || (exports.PGCJobType = {}));
class GW_CS_PGC_JOB_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.PGCJobState = this.Data.readUInt8(0);
        this.PGCJobStatus = this.Data.readUInt8(1);
        this.PGCJobType = this.Data.readUInt8(2);
    }
}
exports.GW_CS_PGC_JOB_NTF = GW_CS_PGC_JOB_NTF;
//# sourceMappingURL=GW_CS_PGC_JOB_NTF.js.map