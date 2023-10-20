"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { SinonSandbox, SinonSpy } from "sinon";
import sinonChai from "sinon-chai";
import {
	GW_ACTIVATE_SCENE_CFM,
	GW_ERROR_NTF,
	GW_GET_SCENE_INFORMATION_CFM,
	GW_GET_SCENE_INFORMATION_NTF,
	GW_GET_SCENE_LIST_CFM,
	GW_GET_SCENE_LIST_NTF,
	GW_SCENE_INFORMATION_CHANGED_NTF,
	GW_SESSION_FINISHED_NTF,
	GW_STOP_SCENE_CFM,
	Scene,
	Scenes,
} from "../src";
import { MockConnection } from "./mocks/mockConnection";

use(chaiAsPromised);
use(sinonChai);

describe("scenes", function () {
	// Setup sinon sandbox
	let sandbox: SinonSandbox;

	this.beforeEach(function () {
		sandbox = sinon.createSandbox();
	});

	this.afterEach(function () {
		sandbox.restore();
	});

	describe("Scenes class", function () {
		// Error frame
		const dataError = Buffer.from([0x04, 0x00, 0x00, 0x07]);
		const dataErrorNtf = new GW_ERROR_NTF(dataError);

		// Frames for scenes list
		const dataScenesListNtf1 = Buffer.from([
			135, 0x04, 0x0e,
			// Number of scenes
			2,
			// Scene 1
			//   ID
			0,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// Scene 2
			//   ID
			1,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// Remaining scenes
			2,
		]);
		const dataScenesListNtf2 = Buffer.from([
			135, 0x04, 0x0e,
			// Number of scenes
			2,
			// Scene 3
			//   ID
			2,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x33, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// Scene 4
			//   ID
			3,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// Remaining scenes
			0,
		]);
		const dataScenesListCfm = Buffer.from([0x06, 0x04, 0x0d, 4]);
		const dataScenesListCfmForEmptyScenes = Buffer.from([0x06, 0x04, 0x0d, 0]);

		// Frames for scenes detail data
		const dataScene1Details = Buffer.from([
			78,
			// Command
			0x04, 0x11,
			// Scene 1
			//   ID
			0,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// # nodes
			2,
			// Node 1
			1, 0, 0xc4, 0x00,
			// Node 2
			2, 1, 0xc7, 0xff,
			// # remaining nodes
			0,
		]);
		const dataScene2Details = Buffer.from([
			78,
			// Command
			0x04, 0x11,
			// Scene 2
			//   ID
			1,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// # nodes
			2,
			// Node 1
			1, 0, 0xc4, 0x00,
			// Node 2
			2, 1, 0xc7, 0xff,
			// # remaining nodes
			0,
		]);
		const dataScene3Details = Buffer.from([
			78,
			// Command
			0x04, 0x11,
			// Scene 3
			//   ID
			2,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x33, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// # nodes
			2,
			// Node 1
			1, 0, 0xc4, 0x00,
			// Node 2
			2, 1, 0xc7, 0xff,
			// # remaining nodes
			0,
		]);
		const dataScene4Details = Buffer.from([
			78,
			// Command
			0x04, 0x11,
			// Scene 4
			//   ID
			3,
			//   Name
			0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			// # nodes
			2,
			// Node 1
			1, 0, 0xc4, 0x00,
			// Node 2
			2, 1, 0xc7, 0xff,
			// # remaining nodes
			0,
		]);
		const dataScene1DetailsCfm = Buffer.from([0x05, 0x04, 0x10, 0x00, 0]);
		const dataScene2DetailsCfm = Buffer.from([0x05, 0x04, 0x10, 0x00, 1]);
		const dataScene3DetailsCfm = Buffer.from([0x05, 0x04, 0x10, 0x00, 2]);
		const dataScene4DetailsCfm = Buffer.from([0x05, 0x04, 0x10, 0x00, 3]);

		const receivedFrames = [
			new GW_GET_SCENE_LIST_NTF(dataScenesListNtf1),
			new GW_GET_SCENE_LIST_NTF(dataScenesListNtf2),
			new GW_GET_SCENE_LIST_CFM(dataScenesListCfm),
			new GW_GET_SCENE_INFORMATION_NTF(dataScene1Details),
			new GW_GET_SCENE_INFORMATION_CFM(dataScene1DetailsCfm),
			new GW_GET_SCENE_INFORMATION_NTF(dataScene2Details),
			new GW_GET_SCENE_INFORMATION_CFM(dataScene2DetailsCfm),
			new GW_GET_SCENE_INFORMATION_NTF(dataScene3Details),
			new GW_GET_SCENE_INFORMATION_CFM(dataScene3DetailsCfm),
			new GW_GET_SCENE_INFORMATION_NTF(dataScene4Details),
			new GW_GET_SCENE_INFORMATION_CFM(dataScene4DetailsCfm),
		];

		const receivedFramesForEmptyScenes = [new GW_GET_SCENE_LIST_CFM(dataScenesListCfmForEmptyScenes)];

		describe("createScenesAsync", async function () {
			it("should create without error with 4 scenes.", async function () {
				const conn = new MockConnection(receivedFrames);
				const result = await Scenes.createScenesAsync(conn);
				expect(result).to.be.instanceOf(Scenes);
				expect(result.Scenes.length).to.be.equal(4, "Number of scenes wrong.");
				for (let sceneIndex = 0; sceneIndex < result.Scenes.length; sceneIndex++) {
					const scene = result.Scenes[sceneIndex];
					expect(scene.SceneID).to.be.equal(sceneIndex);
					expect(scene.SceneName).to.be.equal(`Dummy ${sceneIndex + 1}`);
					expect(scene.IsRunning).to.be.false;
					expect(scene.Products.length).to.be.equal(2);
					expect(scene.Products[0]).to.be.deep.equal({ NodeID: 1, ParameterID: 0, ParameterValue: 0xc400 });
					expect(scene.Products[1]).to.be.deep.equal({ NodeID: 2, ParameterID: 1, ParameterValue: 0xc7ff });
				}
			});

			it("should throw an error on invalid frames.", async function () {
				const conn = new MockConnection([]);
				return expect(Scenes.createScenesAsync(conn)).to.rejectedWith(Error);
			});

			it("should create without error with no scenes.", async function () {
				const conn = new MockConnection(receivedFramesForEmptyScenes);
				const result = await Scenes.createScenesAsync(conn);
				expect(result).to.be.instanceOf(Scenes);
				expect(result.Scenes.length).to.be.equal(0, "Number of scenes wrong.");
			});
		});

		describe("findByName", async function () {
			it("should find scene 'Dummy 1'.", async function () {
				const conn = new MockConnection(receivedFrames);
				const sc = await Scenes.createScenesAsync(conn);
				const result = sc.findByName("Dummy 1");
				expect(result).to.be.instanceOf(Scene).with.property("SceneName", "Dummy 1");
			});
		});

		describe("onChangedScene", function () {
			const dataChangedScene = Buffer.from([5, 0x04, 0x19, 0x01, 2]);
			const dataChangedSceneNtf = new GW_SCENE_INFORMATION_CHANGED_NTF(dataChangedScene);

			it("should change scene ID #2.", async function () {
				const conn = new MockConnection(receivedFrames);
				const sc = await Scenes.createScenesAsync(conn);

				return new Promise((resolve, reject) => {
					sc.onChangedScene((scene) => {
						try {
							expect(scene).to.be.equal(2);
							resolve();
						} catch (e) {
							reject(e);
						}
					});
					conn.sendNotification(dataChangedSceneNtf, [
						new GW_GET_SCENE_INFORMATION_NTF(dataScene3Details),
						new GW_GET_SCENE_INFORMATION_CFM(dataScene3DetailsCfm),
					]);
				});
			});
		});

		describe("onRemovedScene", function () {
			const dataRemovedScene = Buffer.from([5, 0x04, 0x19, 0x00, 2]);
			const dataRemovedSceneNtf = new GW_SCENE_INFORMATION_CHANGED_NTF(dataRemovedScene);

			it("should remove scene ID #2.", async function () {
				const conn = new MockConnection(receivedFrames);
				const sc = await Scenes.createScenesAsync(conn);

				return new Promise((resolve, reject) => {
					sc.onRemovedScene((scene) => {
						try {
							expect(scene).to.be.equal(2);
							expect(sc.findByName("Dummy 3")).to.be.undefined;
							resolve();
						} catch (e) {
							reject(e);
						}
					});
					conn.sendNotification(dataRemovedSceneNtf, []);
				});
			});
		});

		describe("onAddedScene", function () {
			it("should call the notification in onAddedScene 4 times.", async function () {
				const conn = new MockConnection(receivedFramesForEmptyScenes);
				const sc = await Scenes.createScenesAsync(conn);

				conn.valueToReturn.push(...receivedFrames);

				const addedSceneSpy: SinonSpy<number[]> = sandbox.spy();
				sc.onAddedScene((event) => {
					addedSceneSpy(event);
				});

				await sc.refreshScenesAsync();

				expect(addedSceneSpy, "AddedScene").to.be.callCount(4);
			});
		});

		describe("Scene class", function () {
			describe("runAsync", function () {
				const dataRunScene = Buffer.from([0x06, 0x04, 0x13, 0x00, 0x47, 0x11]);
				const dataRunSceneCfm = new GW_ACTIVATE_SCENE_CFM(dataRunScene);
				const dataRunSceneInvalid = Buffer.from([0x06, 0x04, 0x13, 0x02, 0x47, 0x11]);
				const dataRunSceneInvalidCfm = new GW_ACTIVATE_SCENE_CFM(dataRunSceneInvalid);
				const dataSessionFinished = Buffer.from([5, 0x03, 0x04, 0x47, 0x11]);
				const dataSessionFinishedNtf = new GW_SESSION_FINISHED_NTF(dataSessionFinished);

				it("should run scene ID #2.", async function () {
					const conn = new MockConnection([...receivedFrames, dataRunSceneCfm]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					const sessionID = await scene.runAsync();
					expect(sessionID).to.be.equal(0x4711, "Wrong Session ID");
					expect(scene.IsRunning).to.be.true;
					expect(propertyChangedEventSpy.calledOnce).to.be.true;
				});

				it("should run scene ID #2 and set to stop after notification.", async function () {
					const conn = new MockConnection([...receivedFrames, dataRunSceneCfm]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					const sessionID = await scene.runAsync();
					conn.sendNotification(dataSessionFinishedNtf, []);
					expect(sessionID).to.be.equal(0x4711, "Wrong Session ID");
					expect(scene.IsRunning).to.be.false;
					expect(propertyChangedEventSpy.calledTwice).to.be.true;
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new MockConnection([...receivedFrames, dataErrorNtf]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					return expect(scene.runAsync()).to.rejectedWith(Error);
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new MockConnection([...receivedFrames, dataRunSceneInvalidCfm]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					return expect(scene.runAsync()).to.rejectedWith(Error);
				});
			});

			describe("stopAsync", function () {
				const dataStopScene = Buffer.from([0x06, 0x04, 0x16, 0x00, 0x47, 0x11]);
				const dataStopSceneCfm = new GW_STOP_SCENE_CFM(dataStopScene);
				const dataStopSceneInvalid = Buffer.from([0x06, 0x04, 0x16, 0x02, 0x47, 0x11]);
				const dataStopSceneInvalidCfm = new GW_STOP_SCENE_CFM(dataStopSceneInvalid);

				it("should run scene ID #2.", async function () {
					const conn = new MockConnection([...receivedFrames, dataStopSceneCfm]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					const sessionID = await scene.stopAsync();
					expect(sessionID).to.be.equal(0x4711, "Wrong Session ID");
					expect(scene.IsRunning).to.be.false;
					expect(propertyChangedEventSpy.calledOnce).to.be.true;
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new MockConnection([...receivedFrames, dataErrorNtf]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					return expect(scene.stopAsync()).to.rejectedWith(Error);
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new MockConnection([...receivedFrames, dataStopSceneInvalidCfm]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					return expect(scene.stopAsync()).to.rejectedWith(Error);
				});
			});

			describe("refreshAsync", function () {
				const dataScene3DetailsInvalidCfm = Buffer.from([0x05, 0x04, 0x10, 0x01, 2]);

				it("should refresh scene ID #2.", async function () {
					const conn = new MockConnection([...receivedFrames]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					conn.valueToReturn.push(new GW_GET_SCENE_INFORMATION_CFM(dataScene3DetailsCfm));
					const promRefresh = scene.refreshAsync();

					// Just let the asynchronous stuff run before our checks
					await new Promise((resolve) => {
						setTimeout(resolve, 0);
					});

					conn.sendNotification(new GW_GET_SCENE_INFORMATION_NTF(dataScene3Details), []);

					return expect(promRefresh).to.be.fulfilled;
				});

				it("should throw an error on an error frame.", async function () {
					const conn = new MockConnection([...receivedFrames, dataErrorNtf]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					const promRefresh = scene.refreshAsync();

					return expect(promRefresh).to.be.rejectedWith(Error);
				});

				it("should throw an error on request rejected.", async function () {
					const conn = new MockConnection([
						...receivedFrames,
						new GW_GET_SCENE_INFORMATION_CFM(dataScene3DetailsInvalidCfm),
					]);
					const sc = await Scenes.createScenesAsync(conn);
					const scene = sc.Scenes[2];
					const propertyChangedEventSpy = sinon.spy();
					scene.propertyChangedEvent.on((scene) => {
						propertyChangedEventSpy(scene);
					});

					const promRefresh = scene.refreshAsync();

					return expect(promRefresh).to.be.rejectedWith(Error);
				});
			});
		});
	});
});
