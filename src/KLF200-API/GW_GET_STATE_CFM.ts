"use strict";

import { GW_FRAME_CFM } from "./common";

export enum GatewayState {
	TestMode = 0,
	GatewayMode_NoActuatorNodes,
	GatewayMode_WithActuatorNodes,
	BeaconMode_NotConfigured,
	BeaconMode_Configured,
}

export enum GatewaySubState {
	Idle = 0x00,
	RunningConfigurationService,
	RunningSceneConfiguration,
	RunningInformationServiceConfiguration,
	RunningContactInputConfiguration,
	RunningCommand = 0x80,
	RunningActivateGroup,
	RunningActivateScene,
}

export class GW_GET_STATE_CFM extends GW_FRAME_CFM {
	public readonly GatewayState: GatewayState;
	public readonly GatewaySubState: GatewaySubState;
	public readonly StateData: Buffer;

	constructor(Data: Buffer) {
		super(Data);

		this.GatewayState = this.Data.readUInt8(0);
		this.GatewaySubState = this.Data.readUInt8(1);
		this.StateData = this.Data.subarray(2, 6);
	}
}
