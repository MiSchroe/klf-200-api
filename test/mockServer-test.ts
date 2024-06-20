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
		this.timeout(10000);
		this.slow(7000);
		const fn = async function (): Promise<boolean> {
			await using mockServerController = await MockServerController.createMockServer();
			return await Promise.resolve(mockServerController.serverProcess.connected);
		};
		await expect(fn()).to.be.eventually.true;
	});

	it("should stop the mock server", async function () {
		this.timeout(10000);
		this.slow(7000);
		let serverProcess: ChildProcess | undefined = undefined;
		{
			await using mockServer = await MockServerController.createMockServer();
			serverProcess = mockServer.serverProcess;
		}
		expect(serverProcess).to.be.not.undefined;
		expect(serverProcess.connected).to.be.false;
	});
});
