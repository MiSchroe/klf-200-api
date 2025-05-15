"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ChildProcess } from "child_process";
import sinon, { SinonSandbox } from "sinon";
import sinonChai from "sinon-chai";
import { MockServerController } from "./mocks/mockServerController.js";

use(chaiAsPromised);
use(sinonChai);

describe("mockServer", function () {
	// Setup sinon sandbox
	let sandbox: SinonSandbox;

	this.beforeEach(function () {
		sandbox = sinon.createSandbox();
	});

	this.afterEach(function () {
		sandbox.restore();
	});

	it("should start the mock server", async function () {
		this.timeout(20000);
		this.slow(7000);
		const fn = async function (): Promise<boolean> {
			await using mockServerController = await MockServerController.createMockServer();
			return await Promise.resolve(mockServerController.serverProcess.connected);
		};
		await expect(fn()).to.be.eventually.true;
	});

	it("should stop the mock server", async function () {
		this.timeout(20000);
		this.slow(7000);
		let serverProcess: ChildProcess | undefined = undefined;
		{
			await using mockServer = await MockServerController.createMockServer();
			serverProcess = mockServer.serverProcess;
		}
		expect(serverProcess).to.be.not.undefined;
		expect(serverProcess.connected).to.be.false;
	});

	it("should handle errors during server disposal gracefully", async function () {
		this.timeout(20000);
		this.slow(7000);
		const mockServer = await MockServerController.createMockServer();
		const stub = sandbox.stub(mockServer.serverProcess, "kill").throws(new Error("Failed to kill process"));
		try {
			await expect(mockServer[Symbol.asyncDispose]()).to.be.rejectedWith("Failed to kill process");
		} finally {
			stub.restore();
			await mockServer[Symbol.asyncDispose]();
		}
	});

	it("should handle multiple disposals gracefully", async function () {
		this.timeout(20000);
		this.slow(7000);
		const mockServer = await MockServerController.createMockServer();
		await mockServer[Symbol.asyncDispose]();
		await expect(mockServer[Symbol.asyncDispose]()).to.be.fulfilled; // Call dispose again
	});

	it("should handle commands sent to the mock server", async function () {
		this.timeout(20000);
		this.slow(7000);
		await using mockServer = await MockServerController.createMockServer();
		const response = mockServer.sendCommand({
			command: "SendData",
			gatewayCommand: 0x01, // Example command
			data: Buffer.from([0x00, 0x01]).toString("base64"),
		});
		await expect(response).to.be.fulfilled;
	});
});
