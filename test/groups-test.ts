"use strict";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test";
import { fileURLToPath } from "node:url";
import {
	Connection,
	GW_ERROR,
	GatewayCommand,
	Group,
	GroupType,
	Groups,
	KLF200_PORT,
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("groups", { timeout: 20000 }, function () {
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

	describe("groups class", function () {
		describe("createGroupsAsync (default)", function () {
			it("should create without error with 2 groups.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn);
					assert.ok(result instanceof Groups);
					assert.strictEqual(result.Groups.filter((group) => group !== undefined).length, 2);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
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
					await assert.rejects(Groups.createGroupsAsync(conn), Error);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					const result = await Groups.createGroupsAsync(conn);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
						0,
					);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.UserGroup ? 1 : 0)
							);
						}, 0),
						2,
					);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should throw an error when the connection is unavailable", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				await conn.logoutAsync(); // Simulate unavailable connection
				await assert.rejects(Groups.createGroupsAsync(conn), Error);
			});

			it("should handle no groups returned by the gateway", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				await conn.loginAsync("velux123");
				await mockServerController.sendCommand(ResetCommand);
				const result = await Groups.createGroupsAsync(conn);
				assert.strictEqual(result.Groups.length, 0);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn, GroupType.Room);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
						2,
					);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn, GroupType.Room);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.Room ? 1 : 0)
							);
						}, 0),
						2,
					);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn, GroupType.House);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return accumulator + (typeof current === "undefined" ? 0 : 1);
						}, 0),
						1,
					);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const result = await Groups.createGroupsAsync(conn, GroupType.House);
					assert.ok(result instanceof Groups);
					assert.strictEqual(
						result.Groups.reduce((accumulator, current) => {
							return (
								accumulator +
								(typeof current !== "undefined" && current.GroupType === GroupType.House ? 1 : 0)
							);
						}, 0),
						1,
					);
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const groups = await Groups.createGroupsAsync(conn);
					const result = groups.findByName(expectedGroupName);
					assert.ok(result instanceof Group);
					assert.strictEqual(result.Name, expectedGroupName);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onNotificationHandler", function () {
			it("should remove 1 group.", async function (t) {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupRemovedSpy = t.mock.fn();
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

					assert.strictEqual(
						groupRemovedSpy.mock.callCount(),
						1,
						`onRemovedgroup should be called once. Instead it was called ${groupRemovedSpy.mock.callCount()} times.`,
					);
					assert.deepStrictEqual(groupRemovedSpy.mock.calls[0].arguments, [51]);
					assert.strictEqual(groups.Groups[51], undefined);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should change 1 group.", async function (t) {
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
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupChangedSpy = t.mock.fn();
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

					assert.strictEqual(
						groupChangedSpy.mock.callCount(),
						1,
						`onChangedGroup should be called once. Instead it was called ${groupChangedSpy.mock.callCount()} times.`,
					);
					assert.deepStrictEqual(groupChangedSpy.mock.calls[0].arguments, [51]);
					for (const key of Object.keys(expectedGroup) as (keyof typeof expectedGroup)[]) {
						assert.deepStrictEqual(groups.Groups[51]?.[key], expectedGroup[key]);
					}
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should add 1 group.", async function (t) {
				const expectedGroup = { GroupID: 55, Name: "Group 55", Order: 1 };
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					const groups = await Groups.createGroupsAsync(conn);

					// Setups spies for counting notifications
					const groupChangedSpy = t.mock.fn();
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

					assert.strictEqual(
						groupChangedSpy.mock.callCount(),
						1,
						`onChangedGroup should be called once. Instead it was called ${groupChangedSpy.mock.callCount()} times.`,
					);
					assert.deepStrictEqual(groupChangedSpy.mock.calls[0].arguments, [55]);
					for (const key of Object.keys(expectedGroup) as (keyof typeof expectedGroup)[]) {
						assert.strictEqual(groups.Groups[55]?.[key], expectedGroup[key]);
					}
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("[Symbol.dispose]", function () {
			it("should clean up resources", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
					// Overwrite port for parallel unit tests
					port: mockServerController?.port ?? KLF200_PORT,
				});
				await conn.loginAsync("velux123");
				const groups = await Groups.createGroupsAsync(conn);
				groups[Symbol.dispose]();
				assert.strictEqual(groups.Groups.length, 0);
			});
		});
	});

	describe("group class", function () {
		/* Setup is the same for all test cases */
		let conn: Connection;
		let groups: Groups;
		let group: Group;

		beforeEach(async () => {
			conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				// Overwrite port for parallel unit tests
				port: mockServerController?.port ?? KLF200_PORT,
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

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Order", function () {
			it("should return the group's order", function () {
				const expectedResult = 1;
				const result = group.Order;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Placement", function () {
			it("should return the group's placement", function () {
				const expectedResult = 0;
				const result = group.Placement;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Velocity", function () {
			it("should return the group's Velocity", function () {
				const expectedResult = Velocity.Default;
				const result = group.Velocity;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("NodeVariation", function () {
			it("should return the group's NodeVariation", function () {
				const expectedResult = NodeVariation.NotSet;
				const result = group.NodeVariation;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("GroupType", function () {
			it("should return the group's GroupType", function () {
				const expectedResult = GroupType.UserGroup;
				const result = group.GroupType;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Nodes", function () {
			it("should return the group's Nodes", function () {
				const expectedResult = [0, 1];
				const result = group.Nodes;

				assert.deepStrictEqual([...result].sort(), [...expectedResult].sort());
			});
		});

		describe("changeGroupAsync", function () {
			it("should fulfill if all properties are set to different values", async function () {
				const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

				await result;
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

				await result;
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_GROUP_INFORMATION_CFM,
					data: Buffer.from([1, 51]).toString("base64"),
				});

				const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_GROUP_INFORMATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.InvalidSystemTableIndex]).toString("base64"),
				});

				const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

				await assert.rejects(result, Error);
			});
		});

		describe("setNameAsync", function () {
			it("should send a set group information request with changed name", async function () {
				const result = group.setNameAsync("New name");

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setOrderAsync", function () {
			it("should send a set group information request with changed order", async function () {
				const result = group.setOrderAsync(42);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setPlacementAsync", function () {
			it("should send a set group information request with changed placement", async function () {
				const result = group.setPlacementAsync(42);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setVelocityAsync", function () {
			it("should send a set group information request with changed velocity", async function () {
				const result = group.setVelocityAsync(Velocity.Fast);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setNodeVariationAsync", function () {
			it("should send a set group information request with changed node variation", async function () {
				const result = group.setNodeVariationAsync(NodeVariation.Kip);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setNodesAsync", function () {
			it("should send a set group information request with changed node variation", async function () {
				const result = group.setNodesAsync([0, 4]);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setTargetPositionRawAsync", function () {
			it("should send an activate group request without error", async function () {
				const result = group.setTargetPositionRawAsync(0xc000);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("setTargetPositionAsync", function () {
			it("should send a set group information request with changed node variation", async function () {
				const result = group.setTargetPositionAsync(0.5);

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("refreshAsync", function () {
			it("should send a command request", async function () {
				const result = group.refreshAsync();

				await result;
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

				await assert.rejects(result, Error);
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

				await assert.rejects(result, Error);
			});
		});

		describe("onNotificationHandler", function () {
			let propertyChangedSpy: it.Mock<(event: PropertyChangedEvent) => void>;

			beforeEach(function () {
				propertyChangedSpy = mock.fn<(event: PropertyChangedEvent) => void>();
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

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: group,
									propertyName: "Name",
									propertyValue: "Group 1 changed",
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Name",
					);
				});
			});
		});

		describe("dispose", function () {
			it("shouldn't throw an error", function () {
				assert.doesNotThrow(() => group[Symbol.dispose]());
			});
		});
	});
});
