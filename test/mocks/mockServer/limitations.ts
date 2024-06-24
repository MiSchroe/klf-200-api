"use strict";

export interface Limitation {
	NodeID: number;
	ParameterID: number;
	MinValue: number;
	MaxValue: number;
	LimitationOriginator: number;
	LimitationTime: number;
}
