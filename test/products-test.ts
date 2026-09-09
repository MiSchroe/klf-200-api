"use strict";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	ActuatorAlias,
	ActuatorType,
	CommandOriginator,
	Connection,
	GW_ERROR,
	GW_GET_ALL_NODES_INFORMATION_NTF,
	GatewayCommand,
	LimitationType,
	NodeOperatingState,
	NodeVariation,
	ParameterActive,
	PowerSaveMode,
	PriorityLevel,
	Product,
	Products,
	RunStatus,
	StatusReply,
	StatusType,
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

describe("products", { timeout: 20000 }, function () {
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

	describe("Products class", function () {
		describe("createProductsAsync", function () {
			it("should create without error with 4 products.", async function () {
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
					const result = await Products.createProductsAsync(conn);
					assert.ok(result instanceof Products);
					assert.strictEqual(result.Products.length, 4, "Number of products wrong.");
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
						gatewayCommand: GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					await assert.rejects(Products.createProductsAsync(conn), Error);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should create without error without products.", async function () {
				const conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					const result = await Products.createProductsAsync(conn);
					assert.ok(result instanceof Products);
					assert.strictEqual(result.Products.length, 0);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("findByName", function () {
			it("should find product 'Window 2'.", async function () {
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
					const products = await Products.createProductsAsync(conn);
					const result = products.findByName("Window 2");
					assert.ok(result instanceof Product);
					assert.strictEqual(result.Name, "Window 2");
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("requestStatusAsync", function () {
			it("should send a command request", async function () {
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
					const products = await Products.createProductsAsync(conn);
					await products.requestStatusAsync(0, StatusType.RequestMainInfo);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should reject on error status", async function () {
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
					const products = await Products.createProductsAsync(conn);
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_REQ,
						gatewayConfirmation: GatewayCommand.GW_STATUS_REQUEST_CFM,
						data: new ArrayBuilder()
							.addInts(getNextSessionID() + 1)
							.addBytes(0)
							.toBuffer()
							.toString("base64"),
					});
					const result = products.requestStatusAsync(0, StatusType.RequestMainInfo);

					await assert.rejects(result, Error);
				} finally {
					await conn.logoutAsync();
				}
			});

			it("should reject on error frame", async function () {
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
					const products = await Products.createProductsAsync(conn);
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					const result = products.requestStatusAsync(0, StatusType.RequestMainInfo);

					await assert.rejects(result, Error);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onNotificationHandler", function () {
			it("should add 1 product and remove 2 products.", async function (t) {
				await using conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				try {
					await conn.loginAsync("velux123");
					await setupHouseMockup(mockServerController);
					using products = await Products.createProductsAsync(conn);

					// Setups spies for counting notifications
					const productAddedSpy = t.mock.fn();
					const productRemovedSpy = t.mock.fn();
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using _onNewProduct = products.onNewProduct((productID) => {
						productAddedSpy(productID);
					});
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using _onRemovedProduct = products.onRemovedProduct((productID) => {
						productRemovedSpy(productID);
					});

					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 2,
					});
					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 3,
					});
					await mockServerController.sendCommand({
						command: "SetProduct",
						productId: 4,
						product: {
							NodeID: 4,
							Name: "Window 5",
							TypeID: ActuatorType.WindowOpener,
							SubType: 1,
							Order: 0,
							Placement: 0,
							Velocity: Velocity.Default,
							NodeVariation: NodeVariation.Kip,
							PowerSaveMode: PowerSaveMode.LowPowerMode,
							SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
							ProductGroup: 0,
							ProductType: 0,
							State: NodeOperatingState.Done,
							CurrentPositionRaw: 0xc800,
							FP1CurrentPositionRaw: 0xf7ff,
							FP2CurrentPositionRaw: 0xf7ff,
							FP3CurrentPositionRaw: 0xf7ff,
							FP4CurrentPositionRaw: 0xf7ff,
							RemainingTime: 0,
							TimeStamp: new Date().toISOString(),
							ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
							RunStatus: RunStatus.ExecutionCompleted,
							StatusReply: StatusReply.Ok,
							TargetPositionRaw: 0xc800,
							FP1TargetPositionRaw: 0xd400,
							FP2TargetPositionRaw: 0xd400,
							FP3TargetPositionRaw: 0xd400,
							FP4TargetPositionRaw: 0xd400,
						},
					});
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF]);
					});
					const waitPromise2 = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_CFM]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF,
						data: new ArrayBuilder()
							.addBitArray(26, [4])
							.addBitArray(26, [2, 3])
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;
					await waitPromise2;
					await new Promise((resolve) => setImmediate(resolve));

					assert.strictEqual(
						productAddedSpy.mock.callCount(),
						1,
						`onNewProduct should be called once. Instead it was called ${productAddedSpy.mock.callCount()} times.`,
					);
					assert.strictEqual(
						productRemovedSpy.mock.callCount(),
						2,
						`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.mock.callCount()} times.`,
					);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("addNodeAsync", function () {
			it.todo("should throw on error frame.", async function (t) {
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
					const products = await Products.createProductsAsync(conn);

					// Setups spies for counting notifications
					const productAddedSpy = t.mock.fn();
					const productRemovedSpy = t.mock.fn();
					products.onNewProduct((productID) => {
						productAddedSpy(productID);
					});
					products.onRemovedProduct((productID) => {
						productRemovedSpy(productID);
					});

					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 2,
					});
					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 3,
					});
					await mockServerController.sendCommand({
						command: "SetProduct",
						productId: 4,
						product: {
							NodeID: 4,
							Name: "Window 5",
							TypeID: ActuatorType.WindowOpener,
							SubType: 1,
							Order: 0,
							Placement: 0,
							Velocity: Velocity.Default,
							NodeVariation: NodeVariation.Kip,
							PowerSaveMode: PowerSaveMode.LowPowerMode,
							SerialNumber: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]).toString("base64"), // base64 encoded Buffer
							ProductGroup: 0,
							ProductType: 0,
							State: NodeOperatingState.Done,
							CurrentPositionRaw: 0xc800,
							FP1CurrentPositionRaw: 0xf7ff,
							FP2CurrentPositionRaw: 0xf7ff,
							FP3CurrentPositionRaw: 0xf7ff,
							FP4CurrentPositionRaw: 0xf7ff,
							RemainingTime: 0,
							TimeStamp: new Date().toISOString(),
							ProductAlias: [new ActuatorAlias(0xd803, 0xba00)],
							RunStatus: RunStatus.ExecutionCompleted,
							StatusReply: StatusReply.Ok,
							TargetPositionRaw: 0xc800,
							FP1TargetPositionRaw: 0xd400,
							FP2TargetPositionRaw: 0xd400,
							FP3TargetPositionRaw: 0xd400,
							FP4TargetPositionRaw: 0xd400,
						},
					});
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_ERROR_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF,
						data: new ArrayBuilder()
							.addBitArray(26, [4])
							.addBitArray(26, [2, 3])
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					// The SUT's internal retryIfNotBusy() keeps retrying GW_GET_NODE_INFORMATION_REQ for up to 60s as
					// long as it keeps getting "Busy" back. Switch to a non-retryable error so it gives up immediately
					// instead of still being in-flight (and racing with connection teardown) once this test ends.
					const secondErrorPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_ERROR_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.NotFurtherDefined]).toString("base64"),
					});
					await secondErrorPromise;

					assert.strictEqual(
						productAddedSpy.mock.callCount(),
						0,
						`onNewProduct shouldn't be called at all. Instead it was called ${productAddedSpy.mock.callCount()} times.`,
					);
					assert.strictEqual(
						productRemovedSpy.mock.callCount(),
						2,
						`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.mock.callCount()} times.`,
					);
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
				});
				await conn.loginAsync("velux123");
				await setupHouseMockup(mockServerController);
				const products = await Products.createProductsAsync(conn);
				products[Symbol.dispose]();
				assert.strictEqual(products.Products.length, 0);
			});
		});
	});

	describe("Product class", function () {
		/* Setup is the same for all test cases */
		let conn: Connection;
		let products: Products;
		let product: Product;
		beforeEach(async () => {
			conn = conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			await conn.loginAsync("velux123");
			await setupHouseMockup(mockServerController);
			products = await Products.createProductsAsync(conn);
			product = products.Products[0]; // Use the first product for all tests
		});

		afterEach(async () => {
			await conn.logoutAsync();
		});

		describe("Name", function () {
			it("should return the product name", function () {
				const expectedResult = "Window 1";
				const result = product.Name;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Category", function () {
			[
				{ nodeType: 0x0040, category: "Interior venetian blind" },
				{ nodeType: 0x0080, category: "Roller shutter" },
				{ nodeType: 0x0081, category: "Adjustable slats roller shutter" },
				{ nodeType: 0x0082, category: "Roller shutter with projection" },
				{ nodeType: 0x00c0, category: "Vertical exterior awning" },
				{ nodeType: 0x0100, category: "Window opener" },
				{ nodeType: 0x0101, category: "Window opener with integrated rain sensor" },
				{ nodeType: 0x0140, category: "Garage door opener" },
				{ nodeType: 0x017a, category: "Garage door opener" },
				{ nodeType: 0x0180, category: "Light" },
				{ nodeType: 0x01ba, category: "Light" },
				{ nodeType: 0x01c0, category: "Gate opener" },
				{ nodeType: 0x01fa, category: "Gate opener" },
				{ nodeType: 0x0240, category: "Door lock" },
				{ nodeType: 0x0241, category: "Window lock" },
				{ nodeType: 0x0280, category: "Vertical interior blind" },
				{ nodeType: 0x0340, category: "Dual roller shutter" },
				{ nodeType: 0x03c0, category: "On/Off switch" },
				{ nodeType: 0x0400, category: "Horizontal awning" },
				{ nodeType: 0x0440, category: "Exterior venetion blind" },
				{ nodeType: 0x0480, category: "Louvre blind" },
				{ nodeType: 0x04c0, category: "Curtain track" },
				{ nodeType: 0x0500, category: "Ventilation point" },
				{ nodeType: 0x0501, category: "Air inlet" },
				{ nodeType: 0x0502, category: "Air transfer" },
				{ nodeType: 0x0503, category: "Air outlet" },
				{ nodeType: 0x0540, category: "Exterior heating" },
				{ nodeType: 0x057a, category: "Exterior heating" },
				{ nodeType: 0x0600, category: "Swinging shutter" },
				{ nodeType: 0x0601, category: "Swinging shutter with independent handling of the leaves" },
				{ nodeType: 0x0000, category: "0.0" },
			].forEach((category) => {
				it(`should return the product category ${category.category}`, function () {
					const dataTest = Buffer.from([
						0x7f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x01, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42,
						0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x16, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff,
						0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00, 0x4f, 0x00, 0x3f, 0xf3, 0x01, 0xd8, 0x03, 0xb2, 0x1c, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					]);
					// Setup node type
					dataTest.writeUInt16BE(category.nodeType, 72);
					const dataTestNtf = new GW_GET_ALL_NODES_INFORMATION_NTF(dataTest);
					const productTest = new Product(conn, dataTestNtf);
					const expectedResult = category.category;
					const result = productTest.Category;

					assert.strictEqual(result, expectedResult);
				});
			});
		});

		describe("NodeVariation", function () {
			it("should return the node variation", function () {
				const expectedResult = NodeVariation.Kip;
				const result = product.NodeVariation;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Order", function () {
			it("should return the node's order", function () {
				const expectedResult = 0;
				const result = product.Order;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Placement", function () {
			it("should return the node's placement", function () {
				const expectedResult = 0;
				const result = product.Placement;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("State", function () {
			it("should return the node's operating state", function () {
				const expectedResult = NodeOperatingState.Done;
				const result = product.State;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("CurrentPositionRaw", function () {
			it("should return the node's current position raw value", function () {
				const expectedResult = 0xc800;
				const result = product.CurrentPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("TargetPositionRaw", function () {
			it("should return the node's target position raw value", function () {
				const expectedResult = 0xc800;
				const result = product.TargetPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("FP1CurrentPositionRaw", function () {
			it("should return the node's functional parameter 1 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP1CurrentPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("FP2CurrentPositionRaw", function () {
			it("should return the node's functional parameter 2 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP2CurrentPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("FP3CurrentPositionRaw", function () {
			it("should return the node's functional parameter 3 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP3CurrentPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("FP4CurrentPositionRaw", function () {
			it("should return the node's functional parameter 4 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP4CurrentPositionRaw;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("RemainingTime", function () {
			it("should return the node's remaining time for the current operation", function () {
				const expectedResult = 0;
				const result = product.RemainingTime;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("TimeStamp", function () {
			it("should return the node's timestamp of the current data", function () {
				const expectedResult = new Date("2012-01-01T11:13:55.000Z");
				const result = product.TimeStamp;

				assert.deepStrictEqual(result, expectedResult);
			});
		});

		describe("RunStatus", function () {
			it("should return the node's run status", function () {
				const expectedResult = RunStatus.ExecutionCompleted;
				const result = product.RunStatus;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("StatusReply", function () {
			it("should return the node's status reply", function () {
				const expectedResult = StatusReply.Unknown;
				const result = product.StatusReply;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("CurrentPosition", function () {
			it("should return the node's interpreted current position", function () {
				const expectedResult = 0;
				const result = product.CurrentPosition;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("TargetPosition", function () {
			it("should return the node's interpreted target position", function () {
				const expectedResult = 0;
				const result = product.TargetPosition;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("Velocity", function () {
			it("should return the node's velocity", function () {
				const expectedResult = Velocity.Default;
				const result = product.Velocity;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("PowerSaveMode", function () {
			it("should return the node's power save mode", function () {
				const expectedResult = PowerSaveMode.LowPowerMode;
				const result = product.PowerSaveMode;

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("ProductType", function () {
			it("should return the node's product type", function () {
				const expectedResult = 0;
				const result = product.ProductType;

				assert.strictEqual(result, expectedResult);
			});
		});

		for (const parameterActive of [
			ParameterActive.MP,
			ParameterActive.FP1,
			ParameterActive.FP2,
			ParameterActive.FP3,
			ParameterActive.FP4,
			ParameterActive.FP5,
			ParameterActive.FP6,
			ParameterActive.FP7,
			ParameterActive.FP8,
			ParameterActive.FP9,
			ParameterActive.FP10,
			ParameterActive.FP11,
			ParameterActive.FP12,
			ParameterActive.FP13,
			ParameterActive.FP14,
			ParameterActive.FP15,
			ParameterActive.FP16,
		]) {
			describe(`LimitationMinRaw for ${ParameterActive[parameterActive]}`, function () {
				it("should return the node's limitation min raw value", function () {
					const expectedResult = 0;
					const result = product.getLimitationMinRaw(parameterActive);

					assert.strictEqual(result, expectedResult);
				});
			});

			describe(`LimitationMaxRaw for ${ParameterActive[parameterActive]}`, function () {
				it("should return the node's limitation max raw value", function () {
					const expectedResult = 0xc800;
					const result = product.getLimitationMaxRaw(parameterActive);

					assert.strictEqual(result, expectedResult);
				});
			});
		}

		describe("getLimitations", function () {
			it("should return [0.5, 0.25] for a window", function (t) {
				const expectedResult = [0.5, 0.25];

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x6400);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x9600);
				t.mock.method(product, "TypeID", () => ActuatorType.WindowOpener, { getter: true });

				const result = product.getLimitations(ParameterActive.MP);

				assert.deepStrictEqual(result, expectedResult);
			});

			it("should return [0.25, 0.5] for a roller shutter", function (t) {
				const expectedResult = [0.25, 0.5];

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x3200);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x6400);
				t.mock.method(product, "TypeID", () => ActuatorType.RollerShutter, { getter: true });

				const result = product.getLimitations(ParameterActive.MP);

				assert.deepStrictEqual(result, expectedResult);
			});
		});

		describe("getLimitationMin", function () {
			it("should return 0.5 for a window", function (t) {
				const expectedResult = 0.5;

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x6400);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x9600);
				t.mock.method(product, "TypeID", () => ActuatorType.WindowOpener, { getter: true });

				const result = product.getLimitationMin(ParameterActive.MP);

				assert.strictEqual(result, expectedResult);
			});

			it("should return 0.25 for a roller shutter", function (t) {
				const expectedResult = 0.25;

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x3200);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x6400);
				t.mock.method(product, "TypeID", () => ActuatorType.RollerShutter, { getter: true });

				const result = product.getLimitationMin(ParameterActive.MP);

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("getLimitationMax", function () {
			it("should return 0.25 for a window", function (t) {
				const expectedResult = 0.25;

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x6400);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x9600);
				t.mock.method(product, "TypeID", () => ActuatorType.WindowOpener, { getter: true });

				const result = product.getLimitationMax(ParameterActive.MP);

				assert.strictEqual(result, expectedResult);
			});

			it("should return 0.5 for a roller shutter", function (t) {
				const expectedResult = 0.5;

				// Mock the expected raw values:
				t.mock.method(product, "getLimitationMinRaw", () => 0x3200);
				t.mock.method(product, "getLimitationMaxRaw", () => 0x6400);
				t.mock.method(product, "TypeID", () => ActuatorType.RollerShutter, { getter: true });

				const result = product.getLimitationMax(ParameterActive.MP);

				assert.strictEqual(result, expectedResult);
			});
		});

		describe("setNameAsync", function () {
			it("should send a set node name request", async function () {
				const result = product.setNameAsync("New name");

				await result;
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_NAME_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NODE_NAME_CFM,
					data: Buffer.from([2, product.NodeID]).toString("base64"),
				});

				const result = product.setNameAsync("New name");

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_NAME_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setNameAsync("New name");

				await assert.rejects(result, Error);
			});
		});

		describe("setNodeVariationAsync", function () {
			it("should send a set node variation request", async function () {
				const result = product.setNodeVariationAsync(NodeVariation.Kip);

				await result;
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_VARIATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NODE_VARIATION_CFM,
					data: Buffer.from([2, product.NodeID]).toString("base64"),
				});

				const result = product.setNodeVariationAsync(NodeVariation.Kip);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_VARIATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setNodeVariationAsync(NodeVariation.Kip);

				await assert.rejects(result, Error);
			});
		});

		describe("setOrderAndPlacementAsync", function () {
			it("should send a set order and placement request", async function () {
				const result = product.setOrderAndPlacementAsync(1, 2);

				await result;
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_CFM,
					data: Buffer.from([2, product.NodeID]).toString("base64"),
				});

				const result = product.setOrderAndPlacementAsync(1, 2);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setOrderAndPlacementAsync(1, 2);

				await assert.rejects(result, Error);
			});
		});

		describe("setOrderAsync", function () {
			it("should call setOrderAndPlacementAsync", async function (t) {
				const expectedResult = 42;
				const setOrderAndPlacementAsyncStub = t.mock.method(
					product,
					"setOrderAndPlacementAsync",
					async () => undefined,
				);

				await product.setOrderAsync(expectedResult);
				assert.strictEqual(setOrderAndPlacementAsyncStub.mock.callCount(), 1);
				assert.deepStrictEqual(setOrderAndPlacementAsyncStub.mock.calls[0].arguments, [
					expectedResult,
					product.Placement,
				]);
			});
		});

		describe("setPlacementAsync", function () {
			it("should call setOrderAndPlacementAsync", async function (t) {
				const expectedResult = 42;
				const setOrderAndPlacementAsyncStub = t.mock.method(
					product,
					"setOrderAndPlacementAsync",
					async () => undefined,
				);

				await product.setPlacementAsync(expectedResult);
				assert.strictEqual(setOrderAndPlacementAsyncStub.mock.callCount(), 1);
				assert.deepStrictEqual(setOrderAndPlacementAsyncStub.mock.calls[0].arguments, [
					product.Order,
					expectedResult,
				]);
			});
		});

		describe("setTargetPositionAsync", function () {
			it("should send a command request", async function () {
				const result = product.setTargetPositionAsync(0.42);

				assert.strictEqual(await result, getNextSessionID() - 1);
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_COMMAND_SEND_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.setTargetPositionAsync(0.42);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setTargetPositionAsync(0.42);

				await assert.rejects(result, Error);
			});
		});

		describe("setTargetPositionRawAsync", function () {
			it("should send a command request", async function () {
				const result = product.setTargetPositionRawAsync(0x4711);

				assert.strictEqual(await result, getNextSessionID() - 1);
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_COMMAND_SEND_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.setTargetPositionRawAsync(0x4711);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setTargetPositionRawAsync(0x4711);

				await assert.rejects(result, Error);
			});
		});

		describe("stopAsync", function () {
			it("should send a command request", async function () {
				const result = product.stopAsync();

				assert.strictEqual(await result, getNextSessionID() - 1);
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_COMMAND_SEND_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.stopAsync();

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_COMMAND_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.stopAsync();

				await assert.rejects(result, Error);
			});
		});

		describe("winkAsync", function () {
			it("should send a command request", async function () {
				const result = product.winkAsync();

				assert.strictEqual(await result, getNextSessionID() - 1);
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_WINK_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_WINK_SEND_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.winkAsync();

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_WINK_SEND_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.winkAsync();

				await assert.rejects(result, Error);
			});
		});

		describe("refreshAsync", function () {
			it("should send a command request", async function () {
				await product.refreshAsync();
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_GET_NODE_INFORMATION_CFM,
					data: Buffer.from([1, product.NodeID]).toString("base64"),
				});

				const result = product.refreshAsync();

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.refreshAsync();

				await assert.rejects(result, Error);
			});
		});

		describe("refreshLimitation", function () {
			it("should notify LimitationMinRaw change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MinimumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationMinRaw"));
			});

			it("should notify LimitationMaxRaw change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationMaxRaw"));
			});

			it("should notify LimitationOriginator change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationOriginator"));
			});

			it("should notify LimitationOriginatorMin change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MinimumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationOriginatorMin"));
			});

			it("should notify LimitationOriginatorMax change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationOriginatorMax"));
			});

			it("should notify LimitationTimeRaw change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationTimeRaw"));
			});

			it("should notify LimitationTimeRawMin change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MinimumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationTimeRawMin"));
			});

			it("should notify LimitationTimeRawMax change", async function (t) {
				const notifyChange = t.mock.fn();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using dispose = product.propertyChangedEvent.on((event) => {
					notifyChange(event.propertyName);
				});
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.ok(notifyChange.mock.calls.some((call) => call.arguments[0] === "LimitationTimeRawMax"));
			});

			it("should set the limitation originator to rain sensor for MP", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationOriginator(ParameterActive.MP), CommandOriginator.Rain);
			});

			it("should set the limitation originator min to rain sensor for MP", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MinimumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationOriginatorMin(ParameterActive.MP), CommandOriginator.Rain);
			});

			it("should set the limitation originator max to rain sensor for MP", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationOriginatorMax(ParameterActive.MP), CommandOriginator.Rain);
			});

			it("should set the limitation time to 60 seconds", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationTime(ParameterActive.MP), 60);
			});

			it("should set the limitation time min to 60 seconds", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MinimumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationTimeMin(ParameterActive.MP), 60);
			});

			it("should set the limitation time max to 60 seconds", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);
				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				assert.strictEqual(product.getLimitationTimeMax(ParameterActive.MP), 60);
			});

			it("should reject on error status", async function () {
				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_LIMITATION_STATUS_REQ,
					gatewayConfirmation: GatewayCommand.GW_GET_LIMITATION_STATUS_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.refreshLimitationAsync(LimitationType.MaximumLimitation);

				await assert.rejects(result, Error);
			});

			it("should wait until GW_SESSION_FINISHED_NTF", async function (t) {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});
				const sessionFinishedSpy = t.mock.fn();
				const waitPromise = new Promise<void>((resolve) => {
					conn.on(() => {
						sessionFinishedSpy();
						resolve();
					}, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				try {
					await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);

					assert.strictEqual(sessionFinishedSpy.mock.callCount(), 1);
				} finally {
					// Just fulfill the promise
					await waitPromise;
				}
			});

			it("should reject on inconsistent return values (wrong node ID)", async function () {
				await mockServerController.sendCommand({
					command: "SetFunction",
					gatewayCommand: GatewayCommand.GW_GET_LIMITATION_STATUS_REQ,
					func: `function addCommandAndLengthToBuffer(
command,
buffer,
) {
const resultBuffer = Buffer.alloc(3 + buffer.length);
resultBuffer.set(buffer, 3);
resultBuffer.writeUInt16BE(command, 1);
resultBuffer.writeUInt8(resultBuffer.byteLength, 0);
return resultBuffer;
}

const sessionId = frameBuffer.readUInt16BE(3);
const nodeCount = frameBuffer.readUInt8(4);
const nodes = Array.from(frameBuffer.subarray(5, 5 + nodeCount));
const parameterId = frameBuffer.readUInt8(25);
// const limitationType = frameBuffer.readUInt8(26);

const cfmBuffer = Buffer.alloc(3);
cfmBuffer.writeUInt16BE(sessionId, 0);
cfmBuffer.writeUInt8(1, 2);

const ntfBuffer = Buffer.alloc(10);
ntfBuffer.writeUInt16BE(sessionId, 0);
ntfBuffer.writeUInt8(nodes[0] + 1, 2); // Wrong node ID
ntfBuffer.writeUInt8(parameterId, 3);
ntfBuffer.writeUInt16BE(0x0000, 4);
ntfBuffer.writeUInt16BE(0xc800, 6);
ntfBuffer.writeUInt8(255, 7);
ntfBuffer.writeUInt8(255, 8);

const runStatusBuffer = Buffer.alloc(13);
runStatusBuffer.writeUInt16BE(sessionId, 0);
runStatusBuffer.writeUInt8(1, 2);
runStatusBuffer.writeUInt8(nodes[0] + 1, 3);
runStatusBuffer.writeUInt8(parameterId, 4);
runStatusBuffer.writeUInt16BE(0x0000, 5);
runStatusBuffer.writeUInt8(1, 4);
runStatusBuffer.writeUInt8(238, 4);
runStatusBuffer.writeUInt32BE(2097152040, 4);

const sessionFinishedNtfBuffer = Buffer.alloc(2);
sessionFinishedNtfBuffer.writeUInt16BE(sessionId, 0);

return Promise.resolve([
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_GET_LIMITATION_STATUS_CFM},
	Array.from(cfmBuffer),
),
addCommandAndLengthToBuffer(${GatewayCommand.GW_LIMITATION_STATUS_NTF}, Array.from(ntfBuffer)),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_COMMAND_RUN_STATUS_NTF},
	Array.from(runStatusBuffer),
),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_SESSION_FINISHED_NTF},
	Array.from(sessionFinishedNtfBuffer),
),
]);
`,
				});

				const refreshLimitationPromise = product.refreshLimitationAsync(
					LimitationType.MaximumLimitation,
					ParameterActive.MP,
				);

				await assert.rejects(refreshLimitationPromise, Error);
			});

			it("should reject on inconsistent return values (wrong node ID) and wait until GW_SESSION_FINISHED_NTF", async function (t) {
				await mockServerController.sendCommand({
					command: "SetFunction",
					gatewayCommand: GatewayCommand.GW_GET_LIMITATION_STATUS_REQ,
					func: `function addCommandAndLengthToBuffer(
command,
buffer,
) {
const resultBuffer = Buffer.alloc(3 + buffer.length);
resultBuffer.set(buffer, 3);
resultBuffer.writeUInt16BE(command, 1);
resultBuffer.writeUInt8(resultBuffer.byteLength, 0);
return resultBuffer;
}

const sessionId = frameBuffer.readUInt16BE(3);
const nodeCount = frameBuffer.readUInt8(4);
const nodes = Array.from(frameBuffer.subarray(5, 5 + nodeCount));
const parameterId = frameBuffer.readUInt8(25);
// const limitationType = frameBuffer.readUInt8(26);

const cfmBuffer = Buffer.alloc(3);
cfmBuffer.writeUInt16BE(sessionId, 0);
cfmBuffer.writeUInt8(1, 2);

const ntfBuffer = Buffer.alloc(10);
ntfBuffer.writeUInt16BE(sessionId, 0);
ntfBuffer.writeUInt8(nodes[0] + 1, 2); // Wrong node ID
ntfBuffer.writeUInt8(parameterId, 3);
ntfBuffer.writeUInt16BE(0x0000, 4);
ntfBuffer.writeUInt16BE(0xc800, 6);
ntfBuffer.writeUInt8(255, 7);
ntfBuffer.writeUInt8(255, 8);

const runStatusBuffer = Buffer.alloc(13);
runStatusBuffer.writeUInt16BE(sessionId, 0);
runStatusBuffer.writeUInt8(1, 2);
runStatusBuffer.writeUInt8(nodes[0] + 1, 3);
runStatusBuffer.writeUInt8(parameterId, 4);
runStatusBuffer.writeUInt16BE(0x0000, 5);
runStatusBuffer.writeUInt8(1, 4);
runStatusBuffer.writeUInt8(238, 4);
runStatusBuffer.writeUInt32BE(2097152040, 4);

const sessionFinishedNtfBuffer = Buffer.alloc(2);
sessionFinishedNtfBuffer.writeUInt16BE(sessionId, 0);

return Promise.resolve([
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_GET_LIMITATION_STATUS_CFM},
	Array.from(cfmBuffer),
),
addCommandAndLengthToBuffer(${GatewayCommand.GW_LIMITATION_STATUS_NTF}, Array.from(ntfBuffer)),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_COMMAND_RUN_STATUS_NTF},
	Array.from(runStatusBuffer),
),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_SESSION_FINISHED_NTF},
	Array.from(sessionFinishedNtfBuffer),
),
]);
`,
				});

				const sessionFinishedSpy = t.mock.fn();
				const waitPromise = new Promise<void>((resolve) => {
					conn.on(() => {
						sessionFinishedSpy();
						resolve();
					}, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				try {
					const refreshLimitationPromise = product.refreshLimitationAsync(
						LimitationType.MaximumLimitation,
						ParameterActive.MP,
					);

					await assert.rejects(refreshLimitationPromise, Error);

					assert.strictEqual(sessionFinishedSpy.mock.callCount(), 1);
				} finally {
					// Just fulfill the promise
					await waitPromise;
				}
			});

			it("should reject on inconsistent return values (wrong parameter ID)", async function () {
				await mockServerController.sendCommand({
					command: "SetFunction",
					gatewayCommand: GatewayCommand.GW_GET_LIMITATION_STATUS_REQ,
					func: `function addCommandAndLengthToBuffer(
command,
buffer,
) {
const resultBuffer = Buffer.alloc(3 + buffer.length);
resultBuffer.set(buffer, 3);
resultBuffer.writeUInt16BE(command, 1);
resultBuffer.writeUInt8(resultBuffer.byteLength, 0);
return resultBuffer;
}

const sessionId = frameBuffer.readUInt16BE(3);
const nodeCount = frameBuffer.readUInt8(4);
const nodes = Array.from(frameBuffer.subarray(5, 5 + nodeCount));
const parameterId = frameBuffer.readUInt8(25);
// const limitationType = frameBuffer.readUInt8(26);

const cfmBuffer = Buffer.alloc(3);
cfmBuffer.writeUInt16BE(sessionId, 0);
cfmBuffer.writeUInt8(1, 2);

const ntfBuffer = Buffer.alloc(10);
ntfBuffer.writeUInt16BE(sessionId, 0);
ntfBuffer.writeUInt8(nodes[0], 2); // Wrong node ID
ntfBuffer.writeUInt8(parameterId + 1, 3);
ntfBuffer.writeUInt16BE(0x0000, 4);
ntfBuffer.writeUInt16BE(0xc800, 6);
ntfBuffer.writeUInt8(255, 7);
ntfBuffer.writeUInt8(255, 8);

const runStatusBuffer = Buffer.alloc(13);
runStatusBuffer.writeUInt16BE(sessionId, 0);
runStatusBuffer.writeUInt8(1, 2);
runStatusBuffer.writeUInt8(nodes[0] + 1, 3);
runStatusBuffer.writeUInt8(parameterId, 4);
runStatusBuffer.writeUInt16BE(0x0000, 5);
runStatusBuffer.writeUInt8(1, 4);
runStatusBuffer.writeUInt8(238, 4);
runStatusBuffer.writeUInt32BE(2097152040, 4);

const sessionFinishedNtfBuffer = Buffer.alloc(2);
sessionFinishedNtfBuffer.writeUInt16BE(sessionId, 0);

return Promise.resolve([
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_GET_LIMITATION_STATUS_CFM},
	Array.from(cfmBuffer),
),
addCommandAndLengthToBuffer(${GatewayCommand.GW_LIMITATION_STATUS_NTF}, Array.from(ntfBuffer)),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_COMMAND_RUN_STATUS_NTF},
	Array.from(runStatusBuffer),
),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_SESSION_FINISHED_NTF},
	Array.from(sessionFinishedNtfBuffer),
),
]);
`,
				});

				const refreshLimitationPromise = product.refreshLimitationAsync(
					LimitationType.MaximumLimitation,
					ParameterActive.MP,
				);

				await assert.rejects(refreshLimitationPromise, Error);
			});

			it("should reject on inconsistent return values (wrong parameter ID) and wait until GW_SESSION_FINISHED_NTF", async function (t) {
				await mockServerController.sendCommand({
					command: "SetFunction",
					gatewayCommand: GatewayCommand.GW_GET_LIMITATION_STATUS_REQ,
					func: `function addCommandAndLengthToBuffer(
command,
buffer,
) {
const resultBuffer = Buffer.alloc(3 + buffer.length);
resultBuffer.set(buffer, 3);
resultBuffer.writeUInt16BE(command, 1);
resultBuffer.writeUInt8(resultBuffer.byteLength, 0);
return resultBuffer;
}

const sessionId = frameBuffer.readUInt16BE(3);
const nodeCount = frameBuffer.readUInt8(4);
const nodes = Array.from(frameBuffer.subarray(5, 5 + nodeCount));
const parameterId = frameBuffer.readUInt8(25);
// const limitationType = frameBuffer.readUInt8(26);

const cfmBuffer = Buffer.alloc(3);
cfmBuffer.writeUInt16BE(sessionId, 0);
cfmBuffer.writeUInt8(1, 2);

const ntfBuffer = Buffer.alloc(10);
ntfBuffer.writeUInt16BE(sessionId, 0);
ntfBuffer.writeUInt8(nodes[0] + 1, 2); // Wrong node ID
ntfBuffer.writeUInt8(parameterId, 3);
ntfBuffer.writeUInt16BE(0x0000, 4);
ntfBuffer.writeUInt16BE(0xc800, 6);
ntfBuffer.writeUInt8(255, 7);
ntfBuffer.writeUInt8(255, 8);

const runStatusBuffer = Buffer.alloc(13);
runStatusBuffer.writeUInt16BE(sessionId, 0);
runStatusBuffer.writeUInt8(1, 2);
runStatusBuffer.writeUInt8(nodes[0], 3);
runStatusBuffer.writeUInt8(parameterId + 1, 4);
runStatusBuffer.writeUInt16BE(0x0000, 5);
runStatusBuffer.writeUInt8(1, 4);
runStatusBuffer.writeUInt8(238, 4);
runStatusBuffer.writeUInt32BE(2097152040, 4);

const sessionFinishedNtfBuffer = Buffer.alloc(2);
sessionFinishedNtfBuffer.writeUInt16BE(sessionId, 0);

return Promise.resolve([
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_GET_LIMITATION_STATUS_CFM},
	Array.from(cfmBuffer),
),
addCommandAndLengthToBuffer(${GatewayCommand.GW_LIMITATION_STATUS_NTF}, Array.from(ntfBuffer)),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_COMMAND_RUN_STATUS_NTF},
	Array.from(runStatusBuffer),
),
addCommandAndLengthToBuffer(
	${GatewayCommand.GW_SESSION_FINISHED_NTF},
	Array.from(sessionFinishedNtfBuffer),
),
]);
`,
				});

				const sessionFinishedSpy = t.mock.fn();
				const waitPromise = new Promise<void>((resolve) => {
					conn.on(() => {
						sessionFinishedSpy();
						resolve();
					}, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				try {
					const refreshLimitationPromise = product.refreshLimitationAsync(
						LimitationType.MaximumLimitation,
						ParameterActive.MP,
					);

					await assert.rejects(refreshLimitationPromise, Error);

					assert.strictEqual(sessionFinishedSpy.mock.callCount(), 1);
				} finally {
					// Just fulfill the promise
					await waitPromise;
				}
			});
		});

		describe("setLimitationRawAsync", function () {
			it("should send a command request", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				const waitPromise = new Promise((resolve) => {
					conn.on(resolve, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				const result = product.setLimitationRawAsync(0, 0x6400);
				await result;

				// Just let the asynchronous stuff run before our checks
				await waitPromise;

				await result;
			});

			it("should reject on error status", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_LIMITATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_LIMITATION_CFM,
					data: new ArrayBuilder()
						.addInts(getNextSessionID() + 1)
						.addBytes(0)
						.toBuffer()
						.toString("base64"),
				});

				const result = product.setLimitationRawAsync(0, 0x6400);

				await assert.rejects(result, Error);
			});

			it("should reject on error frame", async function () {
				await mockServerController.sendCommand({
					command: "SetLimitation",
					limitation: {
						NodeID: 0,
						ParameterID: 0,
						LimitationOriginator: 2,
						MinValue: 0x0100,
						MaxValue: 0xc700,
						LimitationTime: 1,
					},
				});

				// Mock request
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_LIMITATION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});

				const result = product.setLimitationRawAsync(0, 0x6400);

				await assert.rejects(result, Error);
			});
		});

		describe("clearLimitationAsync", function () {
			it("should call setLimitationRawAsync", async function (t) {
				const spySetLimitationRawAsync = t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				await product.clearLimitationAsync();

				assert.strictEqual(spySetLimitationRawAsync.mock.callCount(), 1);
				assert.deepStrictEqual(spySetLimitationRawAsync.mock.calls[0].arguments, [
					0xd400,
					0xd400,
					ParameterActive.MP,
					255,
					CommandOriginator.SAAC,
					PriorityLevel.ComfortLevel2,
				]);
			});
		});

		describe("setLimitationAsync", function () {
			it("should call setLimitationRawAsync", async function (t) {
				const spySetLimitationRawAsync = t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				await product.setLimitationAsync(0.25, 0.5);

				assert.strictEqual(spySetLimitationRawAsync.mock.callCount(), 1);
				assert.deepStrictEqual(spySetLimitationRawAsync.mock.calls[0].arguments, [
					0x6400,
					0x9600,
					ParameterActive.MP,
					253,
					CommandOriginator.SAAC,
					PriorityLevel.ComfortLevel2,
				]);
			});

			it("should throw if minValue > maxValue", async function (t) {
				t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				const result = product.setLimitationAsync(0.5, 0.25);

				await assert.rejects(result, Error);
			});

			it("should throw if minValue < 0", async function (t) {
				t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				const result = product.setLimitationAsync(-1, 0.25);

				await assert.rejects(result, Error);
			});

			it("should throw if minValue > 1", async function (t) {
				t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				const result = product.setLimitationAsync(1, 1.25);

				await assert.rejects(result, Error);
			});

			it("should throw if maxValue < 0", async function (t) {
				t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				const result = product.setLimitationAsync(-1, -0.25);

				await assert.rejects(result, Error);
			});

			it("should throw if maxValue > 0", async function (t) {
				t.mock.method(product, "setLimitationRawAsync", async () => undefined);

				const result = product.setLimitationAsync(0.25, 1.25);

				await assert.rejects(result, Error);
			});
		});

		describe("onNotificationHandler", function () {
			let propertyChangedSpy: any;

			beforeEach(function (t) {
				propertyChangedSpy = t.mock.fn();
				product.propertyChangedEvent.on((event) => {
					propertyChangedSpy(event);
				});
			});

			describe("GW_NODE_INFORMATION_CHANGED_NTF", function () {
				it("should send notifications for Name", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString("Dummy", 64)
							.addInts(product.Order)
							.addBytes(product.Placement, product.NodeVariation)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Name",
									propertyValue: "Dummy",
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Name",
					);
				});

				it("should send notifications for NodeVariation", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString(product.Name, 64)
							.addInts(product.Order)
							.addBytes(product.Placement, NodeVariation.FlatRoof)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "NodeVariation",
									propertyValue: NodeVariation.FlatRoof,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"NodeVariation",
					);
				});

				it("should send notifications for Order", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString(product.Name, 64)
							.addInts(2)
							.addBytes(product.Placement, product.NodeVariation)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Order",
									propertyValue: 2,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Order",
					);
				});

				it("should send notifications for Placement", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString(product.Name, 64)
							.addInts(product.Order)
							.addBytes(3, product.NodeVariation)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Placement",
									propertyValue: 3,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Placement",
					);
				});

				it("should send notifications for Name only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString("Dummy", 64)
							.addInts(product.Order)
							.addBytes(product.Placement, product.NodeVariation)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "Name");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Name",
									propertyValue: "Dummy",
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Name",
					);
				});

				it("shouldn't send any notifications", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID)
							.addString(product.Name, 64)
							.addInts(product.Order)
							.addBytes(product.Placement, product.NodeVariation)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
				});
			});

			describe("GW_NODE_STATE_POSITION_CHANGED_NTF", function () {
				it("should send notifications for State", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "State",
									propertyValue: NodeOperatingState.Executing,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"State",
					);
				});

				it("should send notifications for CurrentPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "CurrentPositionRaw",
									propertyValue: 0xc000,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"CurrentPositionRaw",
					);
				});

				it("should send notifications for CurrentPosition", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "CurrentPosition",
									propertyValue: 0.040000000000000036,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"CurrentPosition",
					);
				});

				it("should send notifications for TargetPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TargetPositionRaw",
									propertyValue: 0xc700,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TargetPositionRaw",
					);
				});

				it("should send notifications for TargetPosition", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TargetPosition",
									propertyValue: 0.0050000000000000044,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TargetPosition",
					);
				});

				it("should send notifications for FP1CurrentPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP1CurrentPositionRaw",
									propertyValue: 0xf7fe,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP1CurrentPositionRaw",
					);
				});

				it("should send notifications for FP2CurrentPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP2CurrentPositionRaw",
									propertyValue: 0xf7fe,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP2CurrentPositionRaw",
					);
				});

				it("should send notifications for FP3CurrentPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP3CurrentPositionRaw",
									propertyValue: 0xf7fe,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP3CurrentPositionRaw",
					);
				});

				it("should send notifications for FP4CurrentPositionRaw", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP4CurrentPositionRaw",
									propertyValue: 0xf7fe,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP4CurrentPositionRaw",
					);
				});

				it("should send notifications for RemainingTime", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, 4)
							.addInts(0xc000, 0xc700, 0xf7fe, 0xf7fe, 0xf7fe, 0xf7fe, 5)
							.addBytes(0x00, 0xf9, 0x39, 0x90)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "RemainingTime",
									propertyValue: 5,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"RemainingTime",
					);
				});

				it("shouldn't send any notifications", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
						data: new ArrayBuilder()
							.addBytes(product.NodeID, product.State)
							.addInts(
								product.CurrentPositionRaw,
								product.TargetPositionRaw,
								product.FP1CurrentPositionRaw,
								product.FP2CurrentPositionRaw,
								product.FP3CurrentPositionRaw,
								product.FP4CurrentPositionRaw,
								product.RemainingTime,
							)
							.addLongs(product.TimeStamp.getTime() / 1000)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
				});
			});

			describe("GW_COMMAND_RUN_STATUS_NTF", function () {
				describe("Main parameter", function () {
					it("should send notifications for CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 0)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPositionRaw",
						);
					});

					it("should send notifications for CurrentPosition", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 0)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPosition",
										propertyValue: 0.040000000000000036,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPosition",
						);
					});

					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 0)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 0)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});
				});

				describe("FP1", function () {
					it("should send notifications for FP1CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 1)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "FP1CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"FP1CurrentPositionRaw",
						);
					});

					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 1)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 1)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});
				});

				describe("FP2", function () {
					it("should send notifications for FP2CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 2)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "FP2CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"FP2CurrentPositionRaw",
						);
					});

					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 2)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 2)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});
				});

				describe("FP3", function () {
					it("should send notifications for FP3CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 3)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "FP3CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"FP3CurrentPositionRaw",
						);
					});

					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 3)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 3)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});
				});

				describe("FP4", function () {
					it("should send notifications for FP4CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 4)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "FP4CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"FP4CurrentPositionRaw",
						);
					});

					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 4)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(2, 0, 4)
								.addInts(0xc000)
								.addBytes(2, 1, 0, 0, 0, 0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});
				});

				it("shouldn't send any notifications", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_COMMAND_RUN_STATUS_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
						data: new ArrayBuilder()
							.addInts(0x4711)
							.addBytes(2, 0, 0)
							.addInts(0xc800)
							.addBytes(0, 0, 0, 0, 0, 0)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
				});
			});

			describe("GW_COMMAND_REMAINING_TIME_NTF", function () {
				it("should send notifications for RemainingTime", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
						data: new ArrayBuilder()
							.addInts(0x4711)
							.addBytes(0, 0)
							.addInts(42)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "RemainingTime",
									propertyValue: 42,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"RemainingTime",
					);
				});

				it("shouldn't send any notifications", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF]);
					});
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
						data: new ArrayBuilder()
							.addInts(0x4711)
							.addBytes(0, 0)
							.addInts(0)
							.toBuffer()
							.toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
				});
			});

			describe("GW_GET_NODE_INFORMATION_NTF", function () {
				it("shouldn't send any notifications", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
				});

				it("should send notifications for Order only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(2)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "Order");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Order",
									propertyValue: 2,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Order",
					);
				});

				it("should send notifications for Placement only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(2)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "Placement");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Placement",
									propertyValue: 2,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Placement",
					);
				});

				it("should send notifications for Name only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString("Window 1 changed", 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;
					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "Name");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Name",
									propertyValue: "Window 1 changed",
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Name",
					);
				});

				it("should send notifications for Velocity only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(Velocity.Fast)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "Velocity");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "Velocity",
									propertyValue: Velocity.Fast,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"Velocity",
					);
				});

				it("should send notifications for TypeID only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((ActuatorType.RollerShutter << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "TypeID");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TypeID",
									propertyValue: ActuatorType.RollerShutter,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TypeID",
					);
				});

				it("should send notifications for SubType only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | 0)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "SubType");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "SubType",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"SubType",
					);
				});

				it("should send notifications for ProductType only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							6,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "ProductType");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "ProductType",
									propertyValue: 6,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"ProductType",
					);
				});

				it("should send notifications for NodeVariation only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							NodeVariation.TopHung,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "NodeVariation");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "NodeVariation",
									propertyValue: NodeVariation.TopHung,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"NodeVariation",
					);
				});

				it("should send notifications for PowerSaveMode only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							PowerSaveMode.AlwaysAlive,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "PowerSaveMode");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "PowerSaveMode",
									propertyValue: PowerSaveMode.AlwaysAlive,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"PowerSaveMode",
					);
				});

				it("should send notifications for SerialNumber only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...[12, 34, 56, 78, 12, 34, 56, 78],
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "SerialNumber");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "SerialNumber",
									propertyValue: Buffer.from([12, 34, 56, 78, 12, 34, 56, 78]),
								});
								return true;
							} catch {
								return false;
							}
						}),
						"SerialNumber",
					);
				});

				it("should send notifications for State only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							NodeOperatingState.WaitingForPower,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "State");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "State",
									propertyValue: NodeOperatingState.WaitingForPower,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"State",
					);
				});

				it("should send notifications for CurrentPosition/Raw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							0,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "CurrentPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"CurrentPositionRaw",
					);
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "CurrentPosition",
									propertyValue: 1,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"CurrentPosition",
					);
					assert.strictEqual(propertyChangedSpy.mock.callCount(), 2);
				});

				it("should send notifications for TargetPosition/Raw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							0,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TargetPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TargetPositionRaw",
					);
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TargetPosition",
									propertyValue: 1,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TargetPosition",
					);
					assert.strictEqual(propertyChangedSpy.mock.callCount(), 2);
				});

				it("should send notifications for FP1CurrentPositionRaw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							0,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "FP1CurrentPositionRaw");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP1CurrentPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP1CurrentPositionRaw",
					);
				});

				it("should send notifications for FP2CurrentPositionRaw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							0,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "FP2CurrentPositionRaw");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP2CurrentPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP2CurrentPositionRaw",
					);
				});

				it("should send notifications for FP3CurrentPositionRaw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							0,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "FP3CurrentPositionRaw");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP3CurrentPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP3CurrentPositionRaw",
					);
				});

				it("should send notifications for FP4CurrentPositionRaw only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							0,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "FP4CurrentPositionRaw");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "FP4CurrentPositionRaw",
									propertyValue: 0,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"FP4CurrentPositionRaw",
					);
				});

				it("should send notifications for RemainingTime only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							1,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "RemainingTime");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "RemainingTime",
									propertyValue: 1,
								});
								return true;
							} catch {
								return false;
							}
						}),
						"RemainingTime",
					);
				});

				it("should send notifications for TimeStamp only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const expectedTimeStamp = Math.trunc(Date.now() / 1000);
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(expectedTimeStamp)
						.addBytes(numberOfAliases);
					for (const ProductAlias of product.ProductAlias) {
						ab.addInts(ProductAlias.AliasType, ProductAlias.AliasValue);
					}
					if (numberOfAliases < 5) {
						ab.fill((5 - numberOfAliases) * 4);
					}
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "TimeStamp");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "TimeStamp",
									propertyValue: new Date(expectedTimeStamp * 1000),
								});
								return true;
							} catch {
								return false;
							}
						}),
						"TimeStamp",
					);
				});

				it("should send notifications for ProductAlias only", async function () {
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
					});
					const numberOfAliases = product.ProductAlias.length;
					const ab = new ArrayBuilder()
						.addBytes(product.NodeID)
						.addInts(product.Order)
						.addBytes(product.Placement)
						.addString(product.Name, 64)
						.addBytes(product.Velocity)
						.addInts((product.TypeID << 6) | product.SubType)
						.addBytes(
							0xd5 /*product.ProductGroup*/,
							product.ProductType,
							product.NodeVariation,
							product.PowerSaveMode,
							0,
							...product.SerialNumber,
							product.State,
						)
						.addInts(
							product.CurrentPositionRaw,
							product.TargetPositionRaw,
							product.FP1CurrentPositionRaw,
							product.FP2CurrentPositionRaw,
							product.FP3CurrentPositionRaw,
							product.FP4CurrentPositionRaw,
							product.RemainingTime,
						)
						.addLongs(product.TimeStamp.getTime() / 1000)
						.addBytes(numberOfAliases)
						.addInts(0xd803, 0xba01)
						.fill(4 * 4);
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
						data: ab.toBuffer().toString("base64"),
					});

					// Just let the asynchronous stuff run before our checks
					await waitPromise;

					assert.strictEqual(propertyChangedSpy.mock.callCount(), 1, "ProductAlias");
					assert.ok(
						propertyChangedSpy.mock.calls.some((call) => {
							try {
								assert.deepStrictEqual(call.arguments[0], {
									o: product,
									propertyName: "ProductAlias",
									propertyValue: [new ActuatorAlias(0xd803, 0xba01)],
								});
								return true;
							} catch {
								return false;
							}
						}),
						"ProductAlias",
					);
				});
			});

			describe("GW_STATUS_REQUEST_NTF", function () {
				describe("Main Info", function () {
					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});

					it("should send notifications for CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPositionRaw",
										propertyValue: 0xc000,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPositionRaw",
						);
					});

					it("should send notifications for CurrentPosition", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPosition",
										propertyValue: 0.040000000000000036,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPosition",
						);
					});

					it("should send notifications for TargetPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "TargetPositionRaw",
										propertyValue: 0xc700,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"TargetPositionRaw",
						);
					});

					it("should send notifications for TargetPosition", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "TargetPosition",
										propertyValue: 0.0050000000000000044,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"TargetPosition",
						);
					});

					it("should send notifications for RemainingTime", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, product.NodeID, 2, 1, 3)
								.addInts(0xc700, 0xc000, 5)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RemainingTime",
										propertyValue: 5,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RemainingTime",
						);
					});

					it("shouldn't send any notifications", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(product.State, product.NodeID, product.RunStatus, product.StatusReply, 3)
								.addInts(product.TargetPositionRaw, product.CurrentPositionRaw, product.RemainingTime)
								.addLongs(0)
								.addBytes(0)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
					});
				});

				describe("Target Position", function () {
					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 0, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xf7ff)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 0, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xf7ff)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});

					it("should send notifications for TargetPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 0, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xf7ff)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "TargetPositionRaw",
										propertyValue: 0xc700,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"TargetPositionRaw",
						);
					});

					it("should send notifications for TargetPosition", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 0, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xf7ff)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "TargetPosition",
										propertyValue: 0.0050000000000000044,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"TargetPosition",
						);
					});

					it("shouldn't send any notifications", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(
									product.State,
									product.NodeID,
									product.RunStatus,
									product.StatusReply,
									0,
									2,
									0,
								)
								.addInts(product.TargetPositionRaw)
								.addBytes(2)
								.addInts(0xd400)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
					});
				});

				describe("Current Position", function () {
					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 1, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xc700)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 1, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xc700)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});

					it("should send notifications for CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 1, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xc700)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPositionRaw",
										propertyValue: 0xc700,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPositionRaw",
						);
					});

					it("should send notifications for CurrentPosition", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 1, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xc700)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "CurrentPosition",
										propertyValue: 0.0050000000000000044,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"CurrentPosition",
						);
					});

					it("should send notifications for FP2CurrentPositionRaw", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 1, 2, 0)
								.addInts(0xc700)
								.addBytes(2)
								.addInts(0xc700)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "FP2CurrentPositionRaw",
										propertyValue: 0xc700,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"FP2CurrentPositionRaw",
						);
					});

					it("shouldn't send any notifications", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(
									product.State,
									product.NodeID,
									product.RunStatus,
									product.StatusReply,
									0,
									2,
									0,
								)
								.addInts(product.CurrentPositionRaw)
								.addBytes(2)
								.addInts(product.FP2CurrentPositionRaw)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
					});
				});

				describe("Remaining Time", function () {
					it("should send notifications for RunStatus", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 2, 2, 0)
								.addInts(5)
								.addBytes(2)
								.addInts(7)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RunStatus",
										propertyValue: RunStatus.ExecutionActive,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RunStatus",
						);
					});

					it("should send notifications for StatusReply", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 2, 2, 0)
								.addInts(5)
								.addBytes(2)
								.addInts(7)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "StatusReply",
										propertyValue: StatusReply.Ok,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"StatusReply",
						);
					});

					it("should send notifications for RemainingTime", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(1, 0, 2, 1, 2, 2, 0)
								.addInts(5)
								.addBytes(2)
								.addInts(7)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.ok(
							propertyChangedSpy.mock.calls.some((call) => {
								try {
									assert.deepStrictEqual(call.arguments[0], {
										o: product,
										propertyName: "RemainingTime",
										propertyValue: 5,
									});
									return true;
								} catch {
									return false;
								}
							}),
							"RemainingTime",
						);
					});

					it("shouldn't send any notifications", async function () {
						const waitPromise = new Promise((resolve) => {
							conn.on(resolve, [GatewayCommand.GW_STATUS_REQUEST_NTF]);
						});
						await mockServerController.sendCommand({
							command: "SendData",
							gatewayCommand: GatewayCommand.GW_STATUS_REQUEST_NTF,
							data: new ArrayBuilder()
								.addInts(0x4711)
								.addBytes(
									product.State,
									product.NodeID,
									product.RunStatus,
									product.StatusReply,
									2,
									2,
									0,
								)
								.addInts(product.RemainingTime)
								.addBytes(2)
								.addInts(0)
								.fill(15 * 3)
								.toBuffer()
								.toString("base64"),
						});

						// Just let the asynchronous stuff run before our checks
						await waitPromise;

						assert.strictEqual(propertyChangedSpy.mock.callCount(), 0);
					});
				});
			});
		});
	});
});
