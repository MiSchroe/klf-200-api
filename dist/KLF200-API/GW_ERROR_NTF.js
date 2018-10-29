'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
var GW_ERROR;
(function (GW_ERROR) {
    GW_ERROR[GW_ERROR["NotFurtherDefined"] = 0] = "NotFurtherDefined";
    GW_ERROR[GW_ERROR["UnknownCommand"] = 1] = "UnknownCommand";
    GW_ERROR[GW_ERROR["InvalidFrameStructure"] = 2] = "InvalidFrameStructure";
    GW_ERROR[GW_ERROR["Busy"] = 7] = "Busy";
    GW_ERROR[GW_ERROR["InvalidSystemTableIndex"] = 8] = "InvalidSystemTableIndex";
    GW_ERROR[GW_ERROR["NotAuthenticated"] = 12] = "NotAuthenticated";
    GW_ERROR[GW_ERROR["UnknonwErrorCode"] = 255] = "UnknonwErrorCode";
})(GW_ERROR = exports.GW_ERROR || (exports.GW_ERROR = {}));
class GW_ERROR_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        const errorNumber = this.Data.readUInt8(0);
        if (errorNumber in GW_ERROR)
            this.ErrorNumber = errorNumber;
        else
            this.ErrorNumber = GW_ERROR.UnknonwErrorCode;
    }
}
exports.GW_ERROR_NTF = GW_ERROR_NTF;
//# sourceMappingURL=GW_ERROR_NTF.js.map