"use strict";

import assert from "node:assert/strict";
import { ChildProcess } from "node:child_process";
import { describe, it } from "node:test";
import { MockServerController } from "./mocks/mockServerController.js";

describe("mockServer", function () {
	it("should start the mock server", { timeout: 20000 }, async function () {
		const fn = async function (): Promise<boolean> {
			await using mockServerController = await MockServerController.createMockServer();
			return await Promise.resolve(mockServerController.serverProcess.connected);
		};
		assert.strictEqual(await fn(), true);
	});

	it("should stop the mock server", { timeout: 20000 }, async function () {
		let serverProcess: ChildProcess | undefined;
		{
			await using mockServer = await MockServerController.createMockServer();
			serverProcess = mockServer.serverProcess;
		}
		assert.notStrictEqual(serverProcess, undefined);
		assert.strictEqual(serverProcess.connected, false);
	});

	it("should handle errors during server disposal gracefully", { timeout: 20000 }, async function (t) {
		const mockServer = await MockServerController.createMockServer();
		t.mock.method(mockServer.serverProcess, "kill", () => {
			throw new Error("Failed to kill process");
		});
		try {
			await assert.rejects(mockServer[Symbol.asyncDispose](), { message: "Failed to kill process" });
		} finally {
			t.mock.reset();
			await mockServer[Symbol.asyncDispose]();
		}
	});

	it("should handle multiple disposals gracefully", { timeout: 20000 }, async function () {
		const mockServer = await MockServerController.createMockServer();
		await mockServer[Symbol.asyncDispose]();
		await mockServer[Symbol.asyncDispose](); // Call dispose again
	});

	it("should handle commands sent to the mock server", { timeout: 20000 }, async function () {
		await using mockServer = await MockServerController.createMockServer();
		await mockServer.sendCommand({
			command: "SendData",
			gatewayCommand: 0x01, // Example command
			data: Buffer.from([0x00, 0x01]).toString("base64"),
		});
	});
});
