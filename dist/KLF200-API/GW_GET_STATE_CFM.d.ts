import { GW_FRAME_CFM } from "./common";
export declare enum GatewayState {
    TestMode = 0,
    GatewayMode_NoActuatorNodes = 1,
    GatewayMode_WithActuatorNodes = 2,
    BeaconMode_NotConfigured = 3,
    BeaconMode_Configured = 4
}
export declare enum GatewaySubState {
    Idle = 0,
    RunningConfigurationService = 1,
    RunningSceneConfiguration = 2,
    RunningInformationServiceConfiguration = 3,
    RunningContactInputConfiguration = 4,
    RunningCommand = 128,
    RunningActivateGroup = 129,
    RunningActivateScene = 130
}
export declare class GW_GET_STATE_CFM extends GW_FRAME_CFM {
    readonly GatewayState: GatewayState;
    readonly GatewaySubState: GatewaySubState;
    readonly StateData: Buffer;
    constructor(Data: Buffer);
}
