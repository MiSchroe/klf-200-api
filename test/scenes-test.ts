"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import sinon, { SinonSandbox } from "sinon";
import sinonChai from "sinon-chai";
import { fileURLToPath } from "url";
import { Connection, GW_ERROR, GW_SESSION_FINISHED_NTF, GatewayCommand, Scene, Scenes, getNextSessionID } from "../src";
import { ArrayBuilder } from "./mocks/mockServer/ArrayBuilder.js";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";
import { setupHouseMockup } from "./setupHouse.js";
import { waitForNotificationHandler } from "./testUtitlites.js";

const testHOST = "localhost";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

use(chaiAsPromised);
use(sinonChai);

describe("scenes", function () {
	this.timeout(10000);

	let mockServerController: MockServerController;

	this.beforeAll(async function () {
		mockServerController = await MockServerController.createMockServer();
	});

	this.afterAll(async function () {
		await mockServerController[Symbol.asyncDispose]();
	});

	// Setup sinon sandbox
	let sandbox: SinonSandbox;

	this.beforeEach(function () {
		sandbox = sinon.createSandbox();
	});

	this.afterEach(async function () {
		sandbox.restore();
		await mockServerController.sendCommand(ResetCommand);
		await mockServerController.sendCommand(CloseConnectionCommand);
	});

	describe("Scenes class", function () {
		describe("createScenesAsync", async function () {
			it("should create without error with 2 scenes.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Scenes.createScenesAsync(conn);
					await waitForNotificationHandler(conn);
					expect(result).to.be.instanceOf(Scenes);
					expect(result.Scenes.length).to.be.equal(2, "Number of scenes wrong.");
					for (let sceneIndex = 0; sceneIndex < result.Scenes.length; sceneIndex++) {
						const scene = result.Scenes[sceneIndex];
						expect(scene.SceneID).to.be.equal(sceneIndex);
						expect(scene.SceneName).to.be.equal(`Scene ${sceneIndex + 1}`);
						expect(scene.IsRunning).to.be.false;
						expect(scene.Products.length).to.be.equal(3);
						expect(scene.Products[0]).to.be.deep.equal({
							NodeID: 0,
							ParameterID: 0,
							ParameterValue: 0xc800,
						});
						expect(scene.Products[1]).to.be.deep.equal({
							NodeID: 1,
							ParameterID: 0,
							ParameterValue: 0xc800,
						});
					}
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should throw an error on invalid frames.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_SCENE_LIST_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					await expect(Scenes.createScenesAsync(conn)).to.rejectedWith(Error);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create without error with no scenes.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					const result = await Scenes.createScenesAsync(conn);
					expect(result).to.be.instanceOf(Scenes);
					expect(result.Scenes.length).to.be.equal(0, "Number of scenes wrong.");
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("findByName", async function () {
			it("should find scene 'Dummy 1'.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const sc = await Scenes.createScenesAsync(conn);
					const result = sc.findByName("Scene 1");
					expect(result).to.be.instanceOf(Scene).with.property("SceneName", "Scene 1");
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onChangedScene", function () {
			it("should change scene ID #1.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const sc = await Scenes.createScenesAsync(conn);

					const onChangedSceneSpy = sinon.spy();
					const disposable = sc.onChangedScene(onChangedSceneSpy);
					try {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF,
							data: Buffer.from([1, 1]).toString("base64"),
						});
						await waitPromise;
						// Wait for outstanding promises to finish
						await new Promise((resolve) => {
							setImmediate(resolve);
						});

						expect(onChangedSceneSpy).to.be.calledOnceWithExactly(1);
					} finally {
						disposable?.dispose();
					}
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onRemovedScene", function () {
			it("should remove scene ID #1.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const sc = await Scenes.createScenesAsync(conn);
					const onRemovedSceneSpy = sinon.spy();
					const disposable = sc.onRemovedScene(onRemovedSceneSpy);
					try {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF,
							data: Buffer.from([0, 1]).toString("base64"),
						});
						await waitPromise;
						// Wait for outstanding promises to finish
						await new Promise((resolve) => {
							setImmediate(resolve);
						});
						expect(onRemovedSceneSpy).to.be.calledOnceWithExactly(1);
						expect(sc.findByName("Scene 2")).to.be.undefined;
					} finally {
						disposable?.dispose();
					}
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onAddedScene", function () {
			it("should call the notification in onAddedScene once.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const sc = await Scenes.createScenesAsync(conn);
					const onAddedSceneSpy = sinon.spy();
					const disposable = sc.onAddedScene(onAddedSceneSpy);
					try {
						await mockServerController.sendCommand({
							command: "SetScene",
							sceneId: 2,
							scene: {
								SceneID: 2,
								Name: "Scene 3",
								Nodes: [{ NodeID: 0, ParameterID: 0, ParameterValue: 0x0000 }],
							},
						});
						await sc.refreshScenesAsync();
						expect(onAddedSceneSpy).to.be.calledOnceWithExactly(2);
					} finally {
						disposable?.dispose();
					}
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("Scene class", function () {
			describe("runAsync", function () {
				it("should run scene ID #1.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const propertyChangedEventSpy = sinon.spy();
						const disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						try {
							const expectedSessionId = getNextSessionID() + 1;
							const sessionID = await scene.runAsync();
							expect(sessionID).to.be.equal(expectedSessionId, "Wrong Session ID");
							expect(scene.IsRunning).to.be.true;
							expect(propertyChangedEventSpy).to.be.calledOnce;
						} finally {
							disposable?.dispose();
						}
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should run scene ID #1 and set to stop after notification.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const propertyChangedEventSpy = sinon.spy();
						const disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						try {
							const expectedSessionId = getNextSessionID() + 1;
							const sessionID = await scene.runAsync();
							const waitForSessionFinishedNtf = new Promise<void>((resolve) => {
								const disposable = conn.KLF200SocketProtocol?.on((event) => {
									if (event instanceof GW_SESSION_FINISHED_NTF && event.SessionID === sessionID) {
										disposable?.dispose();
										resolve();
									}
								});
							});
							await waitForSessionFinishedNtf;
							expect(sessionID, "SessionId").to.be.equal(expectedSessionId, "Wrong Session ID");
							expect(scene.IsRunning, "IsRunning").to.be.false;
							expect(propertyChangedEventSpy, "PropertyChangedEvent spy").to.be.calledTwice;
						} finally {
							disposable?.dispose();
						}
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_ACTIVATE_SCENE_REQ,
							gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
							data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
						});
						await expect(scene.runAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const sessionId = getNextSessionID() + 1;
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_ACTIVATE_SCENE_REQ,
							gatewayConfirmation: GatewayCommand.GW_ACTIVATE_SCENE_CFM,
							data: new ArrayBuilder().addBytes(1).addInts(sessionId).toBuffer().toString("base64"),
						});
						await expect(scene.runAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});

			describe("stopAsync", function () {
				it("should stop scene ID #1.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const propertyChangedEventSpy = sinon.spy();
						const disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						try {
							const expectedSessionId = getNextSessionID() + 1;
							const sessionID = await scene.stopAsync();
							expect(sessionID).to.be.equal(expectedSessionId, "Wrong Session ID");
							expect(scene.IsRunning).to.be.false;
							expect(propertyChangedEventSpy).to.be.calledOnce;
						} finally {
							disposable?.dispose();
						}
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_STOP_SCENE_REQ,
							gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
							data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
						});
						await expect(scene.stopAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const sessionId = getNextSessionID() + 1;
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_STOP_SCENE_REQ,
							gatewayConfirmation: GatewayCommand.GW_STOP_SCENE_CFM,
							data: new ArrayBuilder().addBytes(1).addInts(sessionId).toBuffer().toString("base64"),
						});
						await expect(scene.stopAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});

			describe("refreshAsync", function () {
				it("should refresh scene ID #1.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						const propertyChangedEventSpy = sinon.spy();
						const disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						try {
							await mockServerController.sendCommand({
								command: "SetScene",
								sceneId: 1,
								scene: {
									SceneID: 1,
									Name: "Scene 2 changed",
									Nodes: [{ NodeID: 0, ParameterID: 0, ParameterValue: 0xc800 }],
								},
							});
							const refreshPromise = scene.refreshAsync();
							await expect(refreshPromise).to.be.fulfilled;
							expect(scene.SceneName, "Scene name").to.be.equal("Scene 2 changed");
						} finally {
							disposable?.dispose();
						}
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_GET_SCENE_INFORMATION_REQ,
							gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
							data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
						});
						await expect(scene.refreshAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new Connection(testHOST, {
						rejectUnauthorized: true,
						requestCert: true,
						ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
						key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
						cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					});
					try {
						await conn.loginAsync("velux123");
						await setupHouseMockup(mockServerController);
						const sc = await Scenes.createScenesAsync(conn);
						const scene = sc.Scenes[1];
						await mockServerController.sendCommand({
							command: "SetConfirmation",
							gatewayCommand: GatewayCommand.GW_GET_SCENE_INFORMATION_REQ,
							gatewayConfirmation: GatewayCommand.GW_GET_SCENE_INFORMATION_CFM,
							data: new ArrayBuilder().addBytes(1, scene.SceneID).toBuffer().toString("base64"),
						});
						await expect(scene.refreshAsync()).to.be.rejectedWith(Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});
		});
	});
});
