"use strict";

import { GatewayCommand, GW_FRAME_NTF, readZString } from "./common.js";
import {
	ActuatorAlias,
	ActuatorType,
	NodeOperatingState,
	NodeVariation,
	PowerSaveMode,
	splitActuatorType,
	Velocity,
} from "./GW_SYSTEMTABLE_DATA.js";

export class GW_GET_ALL_NODES_INFORMATION_NTF extends GW_FRAME_NTF {
	declare readonly Command: GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF;
	public readonly NodeID: number;
	public readonly Order: number;
	public readonly Placement: number;
	public readonly Name: string;
	public readonly Velocity: Velocity;
	public readonly ActuatorType: ActuatorType;
	public readonly ActuatorSubType: number;
	public readonly ProductGroup: number;
	public readonly ProductType: number;
	public readonly NodeVariation: NodeVariation;
	public readonly PowerSaveMode: PowerSaveMode;
	public readonly SerialNumber: Buffer;
	public readonly OperatingState: NodeOperatingState;
	public readonly CurrentPosition: number;
	public readonly TargetPosition: number;
	public readonly FunctionalPosition1CurrentPosition: number;
	public readonly FunctionalPosition2CurrentPosition: number;
	public readonly FunctionalPosition3CurrentPosition: number;
	public readonly FunctionalPosition4CurrentPosition: number;
	public readonly RemainingTime: number;
	public readonly TimeStamp: Date;
	public readonly ActuatorAliases: ActuatorAlias[] = [];

	constructor(Data: Buffer) {
		super(Data);

		this.NodeID = this.Data.readUInt8(0);
		this.Order = this.Data.readUInt16BE(1);
		this.Placement = this.Data.readUInt8(3);
		this.Name = readZString(this.Data.subarray(4, 68));
		this.Velocity = this.Data.readUInt8(68);
		const actuatorTypes = splitActuatorType(this.Data.readUInt16BE(69));
		this.ActuatorType = actuatorTypes.ActuatorType;
		this.ActuatorSubType = actuatorTypes.ActuatorSubType;
		this.ProductGroup = this.Data.readUInt8(71);
		this.ProductType = this.Data.readUInt8(72);
		this.NodeVariation = this.Data.readUInt8(73);
		this.PowerSaveMode = this.Data.readUInt8(74);
		this.SerialNumber = this.Data.subarray(76, 84);
		this.OperatingState = this.Data.readUInt8(84);
		this.CurrentPosition = this.Data.readUInt16BE(85);
		this.TargetPosition = this.Data.readUInt16BE(87);
		this.FunctionalPosition1CurrentPosition = this.Data.readUInt16BE(89);
		this.FunctionalPosition2CurrentPosition = this.Data.readUInt16BE(91);
		this.FunctionalPosition3CurrentPosition = this.Data.readUInt16BE(93);
		this.FunctionalPosition4CurrentPosition = this.Data.readUInt16BE(95);
		this.RemainingTime = this.Data.readUInt16BE(97);
		this.TimeStamp = new Date(this.Data.readUInt32BE(99) * 1000);

		// Read actuator aliases
		const numberOfAliases = this.Data.readUInt8(103);
		for (let index = 0; index < numberOfAliases; index++) {
			const alias = new ActuatorAlias(
				this.Data.readUInt16BE(index * 4 + 104),
				this.Data.readUInt16BE(index * 4 + 106),
			);
			this.ActuatorAliases.push(alias);
		}
	}
}
