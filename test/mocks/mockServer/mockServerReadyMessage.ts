"use strict";

import { Serializable } from "worker_threads";

export type MockServerReadyMessage = {
	type: "ready";
	port: number;
};

// Type Guard for MockServerReadyMessage
export function isMockServerReadyMessage(message: Serializable): message is MockServerReadyMessage {
	return (
		(message as MockServerReadyMessage)?.type === "ready" &&
		typeof (message as MockServerReadyMessage)?.port === "number"
	);
}
