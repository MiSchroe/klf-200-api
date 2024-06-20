"use strict";

import {
	ActuatorAlias,
	ActuatorType,
	GroupType,
	NodeOperatingState,
	NodeVariation,
	ParameterActive,
	PowerSaveMode,
	RunStatus,
	StatusReply,
	Velocity,
} from "../src";
import { Group } from "./mocks/mockServer/groups.js";
import { Product } from "./mocks/mockServer/products.js";
import { Scene } from "./mocks/mockServer/scenes.js";
import { MockServerController } from "./mocks/mockServerController.js";

export async function setupHouseMockup(mockServerController: MockServerController): Promise<void> {
	// Setup products
	const products: Product[] = [
		{
			NodeID: 0,
			Name: "Window 1",
			TypeID: ActuatorType.WindowOpener,
			SubType: 1,
			Order: 0,
			Placement: 0,
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.Kip,
			PowerSaveMode: PowerSaveMode.LowPowerMode,
			SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
			ProductGroup: 0,
			ProductType: 0,
			State: NodeOperatingState.Done,
			CurrentPositionRaw: 0xc800,
			FP1CurrentPositionRaw: 0xf7ff,
			FP2CurrentPositionRaw: 0xf7ff,
			FP3CurrentPositionRaw: 0xf7ff,
			FP4CurrentPositionRaw: 0xf7ff,
			RemainingTime: 0,
			TimeStamp: new Date("2012-01-01T11:13:55.000Z").toISOString(),
			ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
			RunStatus: RunStatus.ExecutionCompleted,
			StatusReply: StatusReply.Ok,
			TargetPositionRaw: 0xc800,
			FP1TargetPositionRaw: 0xd400,
			FP2TargetPositionRaw: 0xd400,
			FP3TargetPositionRaw: 0xd400,
			FP4TargetPositionRaw: 0xd400,
		},
		{
			NodeID: 1,
			Name: "Window 2",
			TypeID: ActuatorType.WindowOpener,
			SubType: 1,
			Order: 0,
			Placement: 0,
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.Kip,
			PowerSaveMode: PowerSaveMode.LowPowerMode,
			SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
			ProductGroup: 0,
			ProductType: 0,
			State: NodeOperatingState.Done,
			CurrentPositionRaw: 0xc800,
			FP1CurrentPositionRaw: 0xf7ff,
			FP2CurrentPositionRaw: 0xf7ff,
			FP3CurrentPositionRaw: 0xf7ff,
			FP4CurrentPositionRaw: 0xf7ff,
			RemainingTime: 0,
			TimeStamp: new Date().toISOString(),
			ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
			RunStatus: RunStatus.ExecutionCompleted,
			StatusReply: StatusReply.Ok,
			TargetPositionRaw: 0xc800,
			FP1TargetPositionRaw: 0xd400,
			FP2TargetPositionRaw: 0xd400,
			FP3TargetPositionRaw: 0xd400,
			FP4TargetPositionRaw: 0xd400,
		},
		{
			NodeID: 2,
			Name: "Window 3",
			TypeID: ActuatorType.WindowOpener,
			SubType: 1,
			Order: 0,
			Placement: 0,
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.Kip,
			PowerSaveMode: PowerSaveMode.LowPowerMode,
			SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
			ProductGroup: 0,
			ProductType: 0,
			State: NodeOperatingState.Done,
			CurrentPositionRaw: 0xc800,
			FP1CurrentPositionRaw: 0xf7ff,
			FP2CurrentPositionRaw: 0xf7ff,
			FP3CurrentPositionRaw: 0xf7ff,
			FP4CurrentPositionRaw: 0xf7ff,
			RemainingTime: 0,
			TimeStamp: new Date().toISOString(),
			ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
			RunStatus: RunStatus.ExecutionCompleted,
			StatusReply: StatusReply.Ok,
			TargetPositionRaw: 0xc800,
			FP1TargetPositionRaw: 0xd400,
			FP2TargetPositionRaw: 0xd400,
			FP3TargetPositionRaw: 0xd400,
			FP4TargetPositionRaw: 0xd400,
		},
		{
			NodeID: 3,
			Name: "Window 4",
			TypeID: ActuatorType.WindowOpener,
			SubType: 1,
			Order: 0,
			Placement: 0,
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.Kip,
			PowerSaveMode: PowerSaveMode.LowPowerMode,
			SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
			ProductGroup: 0,
			ProductType: 0,
			State: NodeOperatingState.Done,
			CurrentPositionRaw: 0xc800,
			FP1CurrentPositionRaw: 0xf7ff,
			FP2CurrentPositionRaw: 0xf7ff,
			FP3CurrentPositionRaw: 0xf7ff,
			FP4CurrentPositionRaw: 0xf7ff,
			RemainingTime: 0,
			TimeStamp: new Date().toISOString(),
			ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
			RunStatus: RunStatus.ExecutionCompleted,
			StatusReply: StatusReply.Ok,
			TargetPositionRaw: 0xc800,
			FP1TargetPositionRaw: 0xd400,
			FP2TargetPositionRaw: 0xd400,
			FP3TargetPositionRaw: 0xd400,
			FP4TargetPositionRaw: 0xd400,
		},
	];

	for (const product of products) {
		await mockServerController.sendCommand({
			command: "SetProduct",
			productId: product.NodeID,
			product: product,
		});
	}

	// Setup groups
	const groups: Group[] = [
		{
			GroupID: 51,
			GroupType: GroupType.UserGroup,
			Order: 1,
			Placement: 0,
			Name: "Group 1",
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.NotSet,
			Nodes: [0, 1],
			Revision: 1234,
		},
		{
			GroupID: 52,
			GroupType: GroupType.UserGroup,
			Order: 1,
			Placement: 0,
			Name: "Group 2",
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.NotSet,
			Nodes: [2, 3],
			Revision: 5678,
		},
		{
			GroupID: 2,
			GroupType: GroupType.Room,
			Order: 1,
			Placement: 0,
			Name: "Room 1",
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.NotSet,
			Nodes: [0, 2],
			Revision: 5678,
		},
		{
			GroupID: 3,
			GroupType: GroupType.Room,
			Order: 1,
			Placement: 0,
			Name: "Room 2",
			Velocity: Velocity.Default,
			NodeVariation: NodeVariation.NotSet,
			Nodes: [1, 3],
			Revision: 5678,
		},
	];
	for (const group of groups) {
		await mockServerController.sendCommand({
			command: "SetGroup",
			groupId: group.GroupID,
			group: group,
		});
	}

	// Setup scenes
	const scenes: Scene[] = [
		{
			SceneID: 0,
			Name: "Scene 1",
			Nodes: [
				{
					NodeID: 0,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
				{
					NodeID: 1,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
				{
					NodeID: 2,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
			],
		},
		{
			SceneID: 1,
			Name: "Scene 2",
			Nodes: [
				{
					NodeID: 0,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
				{
					NodeID: 1,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
				{
					NodeID: 3,
					ParameterID: ParameterActive.MP,
					ParameterValue: 0xc800,
				},
			],
		},
	];
	for (const scene of scenes) {
		await mockServerController.sendCommand({
			command: "SetScene",
			sceneId: scene.SceneID,
			scene: scene,
		});
	}
}
