import {
	ActuatorAlias,
	ActuatorType,
	NodeOperatingState,
	NodeVariation,
	PowerSaveMode,
	RunStatus,
	StatusReply,
	Velocity,
} from "../../../src";

export interface Product {
	NodeID: number;
	Name: string;
	TypeID: ActuatorType;
	SubType: number;
	Order: number;
	Placement: number;
	Velocity: Velocity;
	NodeVariation: NodeVariation;
	PowerSaveMode: PowerSaveMode;
	SerialNumber: string; // base64 encoded Buffer
	ProductGroup: number;
	ProductType: number;
	State: NodeOperatingState;
	CurrentPositionRaw: number;
	FP1CurrentPositionRaw: number;
	FP2CurrentPositionRaw: number;
	FP3CurrentPositionRaw: number;
	FP4CurrentPositionRaw: number;
	RemainingTime: number;
	TimeStamp: string;
	ProductAlias: ActuatorAlias[];
	RunStatus: RunStatus;
	StatusReply: StatusReply;
	LimitationMinRaw: number[];
	LimitationMaxRaw: number[];
	TargetPositionRaw: number;
	FP1TargetPositionRaw: number;
	FP2TargetPositionRaw: number;
	FP3TargetPositionRaw: number;
	FP4TargetPositionRaw: number;
}
