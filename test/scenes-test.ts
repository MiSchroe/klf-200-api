"use strict";

import "disposablestack/auto";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, afterEach, before, describe, it } from "node:test";
import { setImmediate } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { Connection, GW_ERROR, GW_SESSION_FINISHED_NTF, GatewayCommand, Scene, Scenes, getNextSessionID } from "../src";
import { ArrayBuilder } from "./mocks/mockServer/ArrayBuilder.js";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";
import { setupHouseMockup } from "./setupHouse.js";
import { waitForNotificationHandler } from "./testUtitlites.js";

const testHOST = "localhost";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("scenes", { timeout: 20000 }, function () {
	let mockServerController: MockServerController;

	before(async function () {
		mockServerController = await MockServerController.createMockServer();
	});

	after(async function () {
		await mockServerController[Symbol.asyncDispose]();
	});

	afterEach(async function () {
		await mockServerController.sendCommand(ResetCommand);
		await mockServerController.sendCommand(CloseConnectionCommand);
	});

	describe("Scenes class", function () {
		describe("createScenesAsync", function () {
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
					assert.ok(result instanceof Scenes);
					assert.strictEqual(result.Scenes.length, 2, "Number of scenes wrong.");
					for (let sceneIndex = 0; sceneIndex < result.Scenes.length; sceneIndex++) {
						const scene = result.Scenes[sceneIndex];
						assert.strictEqual(scene.SceneID, sceneIndex);
						assert.strictEqual(scene.SceneName, `Scene ${sceneIndex + 1}`);
						assert.strictEqual(scene.IsRunning, false);
						assert.strictEqual(scene.Products.length, 3);
						assert.deepStrictEqual(scene.Products[0], {
							NodeID: 0,
							ParameterID: 0,
							ParameterValue: 0xc800,
						});
						assert.deepStrictEqual(scene.Products[1], {
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
					await assert.rejects(Scenes.createScenesAsync(conn), Error);
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
					assert.ok(result instanceof Scenes);
					assert.strictEqual(result.Scenes.length, 0, "Number of scenes wrong.");
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("findByName", function () {
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
					assert.ok(result instanceof Scene);
					assert.strictEqual(result.SceneName, "Scene 1");
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onChangedScene", function () {
			it("should change scene ID #1.", async function (t) {
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

					const onChangedSceneSpy = t.mock.fn();
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using disposable = sc.onChangedScene(onChangedSceneSpy);
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
					await setImmediate();

					assert.strictEqual(onChangedSceneSpy.mock.callCount(), 1);
					assert.deepStrictEqual(onChangedSceneSpy.mock.calls[0].arguments, [1]);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onRemovedScene", function () {
			it("should remove scene ID #1.", async function (t) {
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
					const onRemovedSceneSpy = t.mock.fn();
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using disposable = sc.onRemovedScene(onRemovedSceneSpy);
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
					await setImmediate();
					assert.strictEqual(onRemovedSceneSpy.mock.callCount(), 1);
					assert.deepStrictEqual(onRemovedSceneSpy.mock.calls[0].arguments, [1]);
					assert.strictEqual(sc.findByName("Scene 2"), undefined);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onAddedScene", function () {
			it("should call the notification in onAddedScene once.", async function (t) {
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
					const onAddedSceneSpy = t.mock.fn();
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using disposable = sc.onAddedScene(onAddedSceneSpy);
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
					assert.strictEqual(onAddedSceneSpy.mock.callCount(), 1);
					assert.deepStrictEqual(onAddedSceneSpy.mock.calls[0].arguments, [2]);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("Scene class", function () {
			describe("runAsync", function () {
				it("should run scene ID #1.", async function (t) {
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
						const propertyChangedEventSpy = t.mock.fn();
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						using disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						const expectedSessionId = getNextSessionID() + 1;
						const sessionID = await scene.runAsync();
						assert.strictEqual(sessionID, expectedSessionId, "Wrong Session ID");
						assert.strictEqual(scene.IsRunning, true);
						assert.strictEqual(propertyChangedEventSpy.mock.callCount(), 1);
					} finally {
						await conn.logoutAsync();
					}
				});

				it("should run scene ID #1 and set to stop after notification.", async function (t) {
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
						const propertyChangedEventSpy = t.mock.fn();
						using stack = new DisposableStack();
						stack.use(scene.propertyChangedEvent.on(propertyChangedEventSpy));
						const expectedSessionId = getNextSessionID() + 1;
						const sessionID = await scene.runAsync();
						const waitForSessionFinishedNtf = new Promise<void>((resolve) => {
							stack.use(
								conn.KLF200SocketProtocol?.on((event) => {
									if (event instanceof GW_SESSION_FINISHED_NTF && event.SessionID === sessionID) {
										resolve();
									}
								}),
							);
						});
						await waitForSessionFinishedNtf;
						assert.strictEqual(sessionID, expectedSessionId, "Wrong Session ID");
						assert.strictEqual(scene.IsRunning, false, "IsRunning");
						assert.strictEqual(propertyChangedEventSpy.mock.callCount(), 2);
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
						await assert.rejects(scene.runAsync(), Error);
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
						await assert.rejects(scene.runAsync(), Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});

			describe("stopAsync", function () {
				it("should stop scene ID #1.", async function (t) {
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
						const propertyChangedEventSpy = t.mock.fn();
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						using disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
						const expectedSessionId = getNextSessionID() + 1;
						const sessionID = await scene.stopAsync();
						assert.strictEqual(sessionID, expectedSessionId, "Wrong Session ID");
						assert.strictEqual(scene.IsRunning, false);
						assert.strictEqual(propertyChangedEventSpy.mock.callCount(), 1);
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
						await assert.rejects(scene.stopAsync(), Error);
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
						await assert.rejects(scene.stopAsync(), Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});

			describe("refreshAsync", function () {
				it("should refresh scene ID #1.", async function (t) {
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
						const propertyChangedEventSpy = t.mock.fn();
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						using disposable = scene.propertyChangedEvent.on(propertyChangedEventSpy);
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
						await refreshPromise;
						assert.strictEqual(scene.SceneName, "Scene 2 changed", "Scene name");
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
						await assert.rejects(scene.refreshAsync(), Error);
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
						await assert.rejects(scene.refreshAsync(), Error);
					} finally {
						await conn.logoutAsync();
					}
				});
			});
		});
	});
});
