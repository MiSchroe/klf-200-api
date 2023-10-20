"use strict";

export enum ActuatorType {
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
	SwingingShutter = 24,
}

export enum PowerSaveMode {
	AlwaysAlive = 0,
	LowPowerMode = 1,
}

export enum Manufacturer {
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
	Atlantic_Group = 12,
}

export function splitActuatorType(value: number): { ActuatorType: ActuatorType; ActuatorSubType: number } {
	return { ActuatorType: <ActuatorType>(value >>> 6), ActuatorSubType: value & 0x3f };
}

export class SystemTableDataEntry {
	constructor(data: Buffer) {
		this.Data = data;
		this.SystemTableIndex = data.readUInt8(0);
		this.ActuatorAddress = data.readUInt8(1) * 65536 + data.readUInt8(2) * 256 + data.readUInt8(3);
		this.ActuatorType = data.readUInt16BE(4) >>> 6;
		this.ActuatorSubType = data.readUInt8(5) & 0x3f;
		const byte6 = data.readUInt8(6);
		this.PowerSaveMode = byte6 & 0x03;
		this.ioMembership = (byte6 & 0x04) === 0x04;
		this.RFSupport = (byte6 & 0x08) === 0x08;
		switch (byte6 >>> 6) {
			case 0:
				this.ActuatorTurnaroundTime = 5;
				break;

			case 1:
				this.ActuatorTurnaroundTime = 10;
				break;

			case 2:
				this.ActuatorTurnaroundTime = 20;
				break;

			case 3:
				this.ActuatorTurnaroundTime = 40;
				break;

			default:
				throw new Error("Invalid actuator turn-around time.");
		}
		this.Manufacturer = data.readUInt8(7);
		this.BackboneReferenceNumber = data.readUInt8(8) * 65536 + data.readUInt8(9) * 256 + data.readUInt8(10);
	}

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

export enum Velocity {
	Default = 0,
	Silent = 1,
	Fast = 2,
	NotAvailable = 255,
}

export enum NodeVariation {
	NotSet = 0,
	TopHung = 1,
	Kip = 2,
	FlatRoof = 3,
	SkyLight = 4,
}

export enum NodeOperatingState {
	NonExecuting = 0,
	Error = 1,
	NotUsed = 2,
	WaitingForPower = 3,
	Executing = 4,
	Done = 5,
	Unknown = 255,
}

export class ActuatorAlias {
	constructor(
		readonly AliasType: number,
		readonly AliasValue: number,
	) {}
}

export enum ControllerCopyMode {
	TransmittingConfigurationMode = 0,
	ReceivingConfigurationMode = 1,
}

export enum ChangeKeyStatus {
	OK_KeyChangeClientController = 0,
	OK_AllNodesUpdated = 2,
	OK_PartialNodesUpdated = 3,
	OK_ClientControllerReceivedKey = 5,
	Failed_LocalStimuliNotDisabled = 7,
	Failed_NoControllerFound = 9,
	Failed_DTSNotReady = 10,
	Failed_DTSError = 11,
	Failed_CSNotReady = 16,
}
