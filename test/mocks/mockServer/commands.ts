import { GatewayCommand } from "../../../src";
import { Gateway } from "./gateway";
import { Group } from "./groups";
import { Limitation } from "./limitations";
import { Product } from "./products";
import { Scene } from "./scenes";

export type CommandSetProduct = {
	command: "SetProduct";
	productId: number;
	product: Product;
};

export type CommandDeleteProduct = {
	command: "DeleteProduct";
	productId: number;
};

export type CommandSetGroup = {
	command: "SetGroup";
	groupId: number;
	group: Group;
};

export type CommandDeleteGroup = {
	command: "DeleteGroup";
	groupId: number;
};

export type CommandSetScene = {
	command: "SetScene";
	sceneId: number;
	scene: Scene;
};

export type CommandDeleteScene = {
	command: "DeleteScene";
	sceneId: number;
};

export type CommandSetGateway = {
	command: "SetGateway";
	gateway: Partial<Gateway>;
};

export type CommandSetLimitation = {
	command: "SetLimitation";
	limitation: Limitation;
};

export type CommandDeleteLimitation = {
	command: "DeleteLimitation";
	nodeId: number;
	parameterId: number;
};

export type CommandSendData = {
	command: "SendData";
	gatewayCommand: GatewayCommand;
	data: string; // base64 encoded buffer data
};

export type CommandReset = {
	command: "Reset";
};
export const ResetCommand: CommandReset = { command: "Reset" };

export type CommandKill = {
	command: "Kill";
};
export const KillCommand: CommandKill = { command: "Kill" };

export type CommandSetConfirmation = {
	command: "SetConfirmation";
	gatewayCommand: GatewayCommand;
	gatewayConfirmation: GatewayCommand;
	data: string; // base64 encoded buffer data
};

export type CommandSetFunction = {
	command: "SetFunction";
	gatewayCommand: GatewayCommand;
	func: string; // function body code that returns a Buffer[] - WARNING: Won't be tested! ONLY FOR DEVELOPMENT PURPOSES!
};

export type CommandCloseConnection = {
	command: "CloseConnection";
};
export const CloseConnectionCommand: CommandCloseConnection = { command: "CloseConnection" };

export type Command =
	| CommandSetProduct
	| CommandDeleteProduct
	| CommandSetGroup
	| CommandDeleteGroup
	| CommandSetScene
	| CommandDeleteScene
	| CommandSetGateway
	| CommandSetLimitation
	| CommandDeleteLimitation
	| CommandReset
	| CommandKill
	| CommandSendData
	| CommandSetConfirmation
	| CommandSetFunction
	| CommandCloseConnection;

export type CommandWithGuid = Command & {
	CommandGuid: string;
};

export type AcknowledgeMessageACK = {
	messageType: "ACK";
	originalCommandGuid: string;
};

export type AcknowledgeMessageERR = {
	messageType: "ERR";
	originalCommandGuid: string;
	errorMessage: string;
};

export type AcknowledgeMessage = AcknowledgeMessageACK | AcknowledgeMessageERR;
