"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFileSync } from "fs";
import { join } from "path";
import sinon, { SinonSandbox, SinonSpy } from "sinon";
import sinonChai from "sinon-chai";
import {
	Connection,
	GW_ERROR,
	GatewayCommand,
	Group,
	GroupType,
	Groups,
	NodeVariation,
	PropertyChangedEvent,
	Velocity,
	getNextSessionID,
} from "../src";
import { ArrayBuilder } from "./mocks/mockServer/ArrayBuilder.js";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";
import { setupHouseMockup } from "./setupHouse.js";

const testHOST = "localhost";
const __dirname = import.meta.dirname;

use(chaiAsPromised);
use(sinonChai);

describe("groups", function () {
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

	describe("groups class", function () {
		describe("createGroupsAsync (default)", function () {
			it("should create without error with 2 groups.", async function () {
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
					const result = await Groups.createGroupsAsync(conn);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
					).to.be.equal(2);
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
						gatewayCommand: GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					await expect(Groups.createGroupsAsync(conn)).to.rejectedWith(Error);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create without error without groups.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					const result = await Groups.createGroupsAsync(conn);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
					).to.be.equal(0);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create groups of type 'User'.", async function () {
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
					const result = await Groups.createGroupsAsync(conn);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.UserGroup ? 1 : 0)
							);
						}, 0),
					).to.be.equal(2);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("createGroupsAsync (rooms)", function () {
			it("should create without error with 2 groups.", async function () {
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
					const result = await Groups.createGroupsAsync(conn, GroupType.Room);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
					).to.be.equal(2);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create groups of type 'Room'.", async function () {
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
					const result = await Groups.createGroupsAsync(conn, GroupType.Room);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.Room ? 1 : 0)
							);
						}, 0),
					).to.be.equal(2);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("createGroupsAsync (house)", function () {
			it("should create without error with 1 group.", async function () {
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
					const result = await Groups.createGroupsAsync(conn, GroupType.House);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
					).to.be.equal(1);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create groups of type 'House'.", async function () {
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
					const result = await Groups.createGroupsAsync(conn, GroupType.House);
					expect(result).to.be.instanceOf(Groups);
					expect(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.House ? 1 : 0)
							);
						}, 0),
					).to.be.equal(1);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("findByName", function () {
			it("should find group 'Group 1'.", async function () {
				const expectedGroupName = "Group 1";
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
					const groups = await Groups.createGroupsAsync(conn);
					const result = groups.findByName(expectedGroupName);
					expect(result).to.be.instanceOf(Group).with.property("Name", expectedGroupName);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onNotificationHandler", function () {
			it("should remove 1 group.", async function () {
				this.slow(1000);
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
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupRemovedSpy = sinon.spy();
					groups.onRemovedGroup((groupID) => {
						groupRemovedSpy(groupID);
					});

					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF,
						data: Buffer.from([0, 51]).toString("base64"),
					});

					// Let the asynchronous stuff run and give the notification some time
					await waitPromise;

					expect(
						groupRemovedSpy,
						`onRemovedgroup should be called once. Instead it was called ${groupRemovedSpy.callCount} times.`,
					).to.be.calledOnceWith(51);
					expect(groups.Groups[51]).to.be.undefined;
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should change 1 group.", async function () {
				this.timeout(10000);
				this.slow(1000);
				const expectedGroup = {
					GroupID: 51,
					Name: "Group 42",
					Order: 2,
					Placement: 3,
					Velocity: Velocity.Silent,
					NodeVariation: NodeVariation.Kip,
					GroupType: GroupType.UserGroup,
					Nodes: [0, 2],
				};
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
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupChangedSpy = sinon.spy();
					groups.onChangedGroup((groupID) => {
						groupChangedSpy(groupID);
					});

					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF,
						data: Buffer.from(
							new ArrayBuilder()
								.addBytes(1, 51)
								.addInts(2)
								.addBytes(3)
								.addString("Group 42", 64)
								.addBytes(Velocity.Silent, NodeVariation.Kip, GroupType.UserGroup, 2)
								.addBitArray(25, [0, 2])
								.addInts(1234)
								.toBuffer(),
						).toString("base64"),
					});

					// Let the asynchronous stuff run and give the notification some time
					await waitPromise;

					expect(
						groupChangedSpy,
						`onChangedGroup should be called once. Instead it was called ${groupChangedSpy.callCount} times.`,
					).to.be.calledOnceWith(51);
					expect(groups.Groups[51]).to.deep.include(expectedGroup);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should add 1 group.", async function () {
				this.timeout(10000);
				this.slow(1000);
				const expectedGroup = { GroupID: 55, Name: "Group 55", Order: 1 };
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
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupChangedSpy = sinon.spy();
					groups.onChangedGroup((groupID) => {
						groupChangedSpy(groupID);
					});

					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF,
						data: Buffer.from(
							new ArrayBuilder()
								.addBytes(1, 55)
								.addInts(1)
								.addBytes(3)
								.addString("Group 55", 64)
								.addBytes(Velocity.Silent, NodeVariation.Kip, GroupType.UserGroup, 2)
								.addBitArray(25, [0, 2])
								.addInts(1234)
								.toBuffer(),
						).toString("base64"),
					});

					// Let the asynchronous stuff run and give the notification some time
					await waitPromise;

					expect(
						groupChangedSpy,
						`onChangedGroup should be called once. Instead it was called ${groupChangedSpy.callCount} times.`,
					).to.be.calledOnceWith(55);
					expect(groups.Groups[55]).to.include(expectedGroup);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("group class", function () {
			/* Setup is the same for all test cases */
			let conn: Connection;
			let groups: Groups;
			let group: Group;
			this.beforeEach(async () => {
				conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				await conn.loginAsync("velux123");
				await setupHouseMockup(mockServerController);
				groups = await Groups.createGroupsAsync(conn);
				group = groups.Groups[51]; // Use the group 51 for all tests
			});

			describe("Name", function () {
				it("should return the group name", function () {
					const expectedResult = "Group 1";
					const result = group.Name;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("Order", function () {
				it("should return the group's order", function () {
					const expectedResult = 1;
					const result = group.Order;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("Placement", function () {
				it("should return the group's placement", function () {
					const expectedResult = 0;
					const result = group.Placement;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("Velocity", function () {
				it("should return the group's Velocity", function () {
					const expectedResult = Velocity.Default;
					const result = group.Velocity;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("NodeVariation", function () {
				it("should return the group's NodeVariation", function () {
					const expectedResult = NodeVariation.NotSet;
					const result = group.NodeVariation;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("GroupType", function () {
				it("should return the group's GroupType", function () {
					const expectedResult = GroupType.UserGroup;
					const result = group.GroupType;

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe("Nodes", function () {
				it("should return the group's Nodes", function () {
					const expectedResult = [0, 1];
					const result = group.Nodes;

					expect(result).to.have.members(expectedResult);
				});
			});

			describe("changeGroupAsync", function () {
				it("should fulfill if all properties are set to different values", async function () {
					const result = group.changeGroupAsync(
						4,
						7,
						"Some windows",
						Velocity.Silent,
						NodeVariation.Kip,
						[2, 4],
					);

					await expect(result).to.be.fulfilled;
				});

				it("should fulfill if all properties are set to same values", async function () {
					const result = group.changeGroupAsync(
						group.Order,
						group.Placement,
						group.Name,
						group.Velocity,
						group.NodeVariation,
						[...group.Nodes],
					);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.changeGroupAsync(
						4,
						7,
						"Some windows",
						Velocity.Silent,
						NodeVariation.Kip,
						[2, 4],
					);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.changeGroupAsync(
						4,
						7,
						"Some windows",
						Velocity.Silent,
						NodeVariation.Kip,
						[2, 4],
					);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setNameAsync", function () {
				it("should send a set group information request with changed name", async function () {
					const result = group.setNameAsync("New name");

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setNameAsync("New name");

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setNameAsync("New name");

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setOrderAsync", function () {
				it("should send a set group information request with changed order", async function () {
					const result = group.setOrderAsync(42);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setOrderAsync(42);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setOrderAsync(42);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setPlacementAsync", function () {
				it("should send a set group information request with changed placement", async function () {
					const result = group.setPlacementAsync(42);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setPlacementAsync(42);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setPlacementAsync(42);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setVelocityAsync", function () {
				it("should send a set group information request with changed velocity", async function () {
					const result = group.setVelocityAsync(Velocity.Fast);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setVelocityAsync(Velocity.Fast);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setVelocityAsync(Velocity.Fast);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setNodeVariationAsync", function () {
				it("should send a set group information request with changed node variation", async function () {
					const result = group.setNodeVariationAsync(NodeVariation.Kip);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setNodeVariationAsync(NodeVariation.Kip);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setNodeVariationAsync(NodeVariation.Kip);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setNodesAsync", function () {
				it("should send a set group information request with changed node variation", async function () {
					const result = group.setNodesAsync([0, 4]);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
						data: Buffer.from([1, 51]).toString("base64"),
					});

					const result = group.setNodesAsync([0, 4]);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setNodesAsync([0, 4]);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setTargetPositionRawAsync", function () {
				it("should send an activate group request without error", async function () {
					const result = group.setTargetPositionRawAsync(0xc000);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ,
						gatewayConfirmation: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_CFM,
						data: Buffer.from(
							new ArrayBuilder()
								.addInts((getNextSessionID() + 1) & 0xffff) // Get the value of the next session
								.addBytes(1, 51)
								.toBuffer(),
						).toString("base64"),
					});

					const result = group.setTargetPositionRawAsync(0xc000);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setTargetPositionRawAsync(0xc000);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setTargetPositionAsync", function () {
				it("should send a set group information request with changed node variation", async function () {
					const result = group.setTargetPositionAsync(0.5);

					await expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ,
						gatewayConfirmation: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_CFM,
						data: Buffer.from(
							new ArrayBuilder()
								.addInts((getNextSessionID() + 1) & 0xffff) // Get the value of the next session
								.addBytes(1, 51)
								.toBuffer(),
						).toString("base64"),
					});

					const result = group.setTargetPositionAsync(0.5);

					await expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.setTargetPositionAsync(0.5);

					await expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("refreshAsync", function () {
				it("should send a command request", async function () {
					const result = group.refreshAsync();

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_GET_GROUP_INFORMATION_CFM,
						data: Buffer.from(new ArrayBuilder().addBytes(2, 51).toBuffer()).toString("base64"),
					});

					const result = group.refreshAsync();

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_GROUP_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
					});

					const result = group.refreshAsync();

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("onNotificationHandler", function () {
				let propertyChangedSpy: SinonSpy<PropertyChangedEvent[]>;

				this.beforeEach(function () {
					propertyChangedSpy = sandbox.spy();
					group.propertyChangedEvent.on((event) => {
						propertyChangedSpy(event);
					});
				});

				describe("GW_GET_GROUP_INFORMATION_NTF", function () {
					it("should send notifications for Name", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_GET_GROUP_INFORMATION_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_GET_GROUP_INFORMATION_NTF,
							data: new ArrayBuilder()
								.addBytes(group.GroupID)
								.addInts(group.Order)
								.addBytes(group.Placement)
								.addString("Group 1 changed", 64)
								.addBytes(group.Velocity, group.NodeVariation, group.GroupType, group.Nodes.length)
								.addBitArray(25, group.Nodes)
								.addInts(1234)
								.toBuffer()
								.toString("base64"),
						});

						// Let the asynchronous stuff run and give the notification some time
						await waitPromise;

						expect(propertyChangedSpy, "Name").to.be.calledWith({
							o: group,
							propertyName: "Name",
							propertyValue: "Group 1 changed",
						});
					});
				});
			});
		});
	});
});
