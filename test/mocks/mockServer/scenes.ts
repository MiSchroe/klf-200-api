import { ParameterActive } from "../../../src";

export interface SceneInformationEntry {
	NodeID: number;
	ParameterID: ParameterActive;
	ParameterValue: number;
}

export interface Scene {
	SceneID: number;
	Name: string;
	Nodes: SceneInformationEntry[];
}
