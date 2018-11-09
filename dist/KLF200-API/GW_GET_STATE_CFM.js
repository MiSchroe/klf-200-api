'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
var GatewayState;
(function (GatewayState) {
    GatewayState[GatewayState["TestMode"] = 0] = "TestMode";
    GatewayState[GatewayState["GatewayMode_NoActuatorNodes"] = 1] = "GatewayMode_NoActuatorNodes";
    GatewayState[GatewayState["GatewayMode_WithActuatorNodes"] = 2] = "GatewayMode_WithActuatorNodes";
    GatewayState[GatewayState["BeaconMode_NotConfigured"] = 3] = "BeaconMode_NotConfigured";
    GatewayState[GatewayState["BeaconMode_Configured"] = 4] = "BeaconMode_Configured";
})(GatewayState = exports.GatewayState || (exports.GatewayState = {}));
var GatewaySubState;
(function (GatewaySubState) {
    GatewaySubState[GatewaySubState["Idle"] = 0] = "Idle";
    GatewaySubState[GatewaySubState["RunningConfigurationService"] = 1] = "RunningConfigurationService";
    GatewaySubState[GatewaySubState["RunningSceneConfiguration"] = 2] = "RunningSceneConfiguration";
    GatewaySubState[GatewaySubState["RunningInformationServiceConfiguration"] = 3] = "RunningInformationServiceConfiguration";
    GatewaySubState[GatewaySubState["RunningContactInputConfiguration"] = 4] = "RunningContactInputConfiguration";
    GatewaySubState[GatewaySubState["RunningCommand"] = 128] = "RunningCommand";
    GatewaySubState[GatewaySubState["RunningActivateGroup"] = 129] = "RunningActivateGroup";
    GatewaySubState[GatewaySubState["RunningActivateScene"] = 130] = "RunningActivateScene";
})(GatewaySubState = exports.GatewaySubState || (exports.GatewaySubState = {}));
class GW_GET_STATE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.GatewayState = this.Data.readUInt8(0);
        this.GatewaySubState = this.Data.readUInt8(1);
        this.StateData = this.Data.slice(2, 6);
    }
}
exports.GW_GET_STATE_CFM = GW_GET_STATE_CFM;
//# sourceMappingURL=GW_GET_STATE_CFM.js.map