"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import sinon, { SinonSandbox, SinonSpy } from "sinon";
import sinonChai from "sinon-chai";
import { fileURLToPath } from "url";
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
import { PropertyChangedEvent } from "../src/utils/PropertyChangedEvent";
import { ArrayBuilder } from "./mocks/mockServer/ArrayBuilder.js";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";
import { setupHouseMockup } from "./setupHouse.js";

const testHOST = "localhost";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

use(chaiAsPromised);
use(sinonChai);

describe("products", function () {
	// this.timeout(10000000);
	this.timeout(20000);

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
					expect(result).to.be.instanceOf(Products);
					expect(result.Products.length).to.be.equal(4, "Number of products wrong.");
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
					await expect(Products.createProductsAsync(conn)).to.be.rejectedWith(Error);
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
					expect(result).to.be.instanceOf(Products);
					expect(result.Products.length).to.be.equal(0);
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
					expect(result).to.be.instanceOf(Product).with.property("Name", "Window 2");
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
					const result = products.requestStatusAsync(0, StatusType.RequestMainInfo);

					await expect(result).to.be.fulfilled;
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

					await expect(result).to.be.rejectedWith(Error);
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

					await expect(result).to.be.rejectedWith(Error);
				} finally {
					await conn.logoutAsync();
				}
			});
		});

		describe("onNotificationHandler", function () {
			it.only("should add 1 product and remove 2 products.", async function () {
				console.log(`Unit test started.`);
				await using conn = new Connection(testHOST, {
					rejectUnauthorized: true,
					requestCert: true,
					ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
					key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
					cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
				});
				console.log(`Connection created.`);
				try {
					await conn.loginAsync("velux123");
					console.log(`Logged in.`);
					await setupHouseMockup(mockServerController);
					console.log(`Household created.`);
					using products = await Products.createProductsAsync(conn);
					console.log(`Products read.`);

					// Setups spies for counting notifications
					const productAddedSpy = sinon.spy();
					const productRemovedSpy = sinon.spy();
					using _onNewProduct = products.onNewProduct((productID) => {
						productAddedSpy(productID);
						console.log(`ProductAddedSpy called with ${productID}.`);
					});
					console.log(`onNewProduct handler added.`);
					using _onRemovedProduct = products.onRemovedProduct((productID) => {
						productRemovedSpy(productID);
						console.log(`ProductRemovedSpy called with ${productID}.`);
					});
					console.log(`onRemovedProduct handler added.`);

					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 2,
					});
					console.log(`DeleteProduct for productId 2 sent.`);
					await mockServerController.sendCommand({
						command: "DeleteProduct",
						productId: 3,
					});
					console.log(`DeleteProduct for productId 3 sent.`);
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
					console.log(`SetProduct for productId 4 sent.`);
					await mockServerController.sendCommand({
						command: "SetConfirmation",
						gatewayCommand: GatewayCommand.GW_GET_NODE_INFORMATION_REQ,
						gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
						data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
					});
					console.log(`SetConfirmation sent.`);
					const waitPromise = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF]);
						console.log(`Handler for GW_CS_SYSTEM_TABLE_UPDATE_NTF added.`);
					});
					console.log(`waitPromise created.`);
					const waitPromise2 = new Promise((resolve) => {
						conn.on(resolve, [GatewayCommand.GW_GET_NODE_INFORMATION_CFM]);
						console.log(`Handler for GW_GET_NODE_INFORMATION_CFM added.`);
					});
					console.log(`waitPromise2 created.`);
					await mockServerController.sendCommand({
						command: "SendData",
						gatewayCommand: GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF,
						data: new ArrayBuilder()
							.addBitArray(26, [4])
							.addBitArray(26, [2, 3])
							.toBuffer()
							.toString("base64"),
					});
					console.log(`SendData sent.`);

					// Just let the asynchronous stuff run before our checks
					await waitPromise;
					console.log(`waitPromise awaited.`);
					await waitPromise2;
					console.log(`waitPromise2 awaited.`);
					await new Promise((resolve) => setImmediate(resolve));
					console.log(`setImmediate awaited.`);

					expect(
						productAddedSpy,
						`onNewProduct should be called once. Instead it was called ${productAddedSpy.callCount} times.`,
					).to.be.calledOnce;
					console.log(`productAddedSpy checked.`);
					expect(
						productRemovedSpy,
						`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.callCount} times.`,
					).to.be.calledTwice;
					console.log(`productRemovedSpy checked.`);
				} finally {
					await conn.logoutAsync();
					console.log(`Logged out.`);
				}
				console.log(`Unit test finished.`);
			});
		});

		describe("addNodeAsync", function () {
			it("should throw on error frame.", async function () {
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
					const productAddedSpy = sinon.spy();
					const productRemovedSpy = sinon.spy();
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

					expect(
						productAddedSpy.notCalled,
						`onNewProduct shouldn't be called at all. Instead it was called ${productAddedSpy.callCount} times.`,
					).to.be.true;
					expect(
						productRemovedSpy.calledTwice,
						`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.callCount} times.`,
					).to.be.true;
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
				expect(products.Products.length).to.equal(0);
			});
		});
	});

	describe("Product class", function () {
		/* Setup is the same for all test cases */
		let conn: Connection;
		let products: Products;
		let product: Product;
		this.beforeEach(async () => {
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

		this.afterEach(async () => {
			await conn.logoutAsync();
		});

		describe("Name", function () {
			it("should return the product name", function () {
				const expectedResult = "Window 1";
				const result = product.Name;

				expect(result).to.be.equal(expectedResult);
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

					expect(result).to.be.equal(expectedResult);
				});
			});
		});

		describe("NodeVariation", function () {
			it("should return the node variation", function () {
				const expectedResult = NodeVariation.Kip;
				const result = product.NodeVariation;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("Order", function () {
			it("should return the node's order", function () {
				const expectedResult = 0;
				const result = product.Order;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("Placement", function () {
			it("should return the node's placement", function () {
				const expectedResult = 0;
				const result = product.Placement;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("State", function () {
			it("should return the node's operating state", function () {
				const expectedResult = NodeOperatingState.Done;
				const result = product.State;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("CurrentPositionRaw", function () {
			it("should return the node's current position raw value", function () {
				const expectedResult = 0xc800;
				const result = product.CurrentPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("TargetPositionRaw", function () {
			it("should return the node's target position raw value", function () {
				const expectedResult = 0xc800;
				const result = product.TargetPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("FP1CurrentPositionRaw", function () {
			it("should return the node's functional parameter 1 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP1CurrentPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("FP2CurrentPositionRaw", function () {
			it("should return the node's functional parameter 2 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP2CurrentPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("FP3CurrentPositionRaw", function () {
			it("should return the node's functional parameter 3 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP3CurrentPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("FP4CurrentPositionRaw", function () {
			it("should return the node's functional parameter 4 position raw value", function () {
				const expectedResult = 0xf7ff;
				const result = product.FP4CurrentPositionRaw;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("RemainingTime", function () {
			it("should return the node's remaining time for the current operation", function () {
				const expectedResult = 0;
				const result = product.RemainingTime;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("TimeStamp", function () {
			it("should return the node's timestamp of the current data", function () {
				const expectedResult = new Date("2012-01-01T11:13:55.000Z");
				const result = product.TimeStamp;

				expect(result).to.be.deep.equal(expectedResult);
			});
		});

		describe("RunStatus", function () {
			it("should return the node's run status", function () {
				const expectedResult = RunStatus.ExecutionCompleted;
				const result = product.RunStatus;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("StatusReply", function () {
			it("should return the node's status reply", function () {
				const expectedResult = StatusReply.Unknown;
				const result = product.StatusReply;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("CurrentPosition", function () {
			it("should return the node's interpreted current position", function () {
				const expectedResult = 0;
				const result = product.CurrentPosition;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("TargetPosition", function () {
			it("should return the node's interpreted target position", function () {
				const expectedResult = 0;
				const result = product.TargetPosition;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("Velocity", function () {
			it("should return the node's velocity", function () {
				const expectedResult = Velocity.Default;
				const result = product.Velocity;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("PowerSaveMode", function () {
			it("should return the node's power save mode", function () {
				const expectedResult = PowerSaveMode.LowPowerMode;
				const result = product.PowerSaveMode;

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("ProductType", function () {
			it("should return the node's product type", function () {
				const expectedResult = 0;
				const result = product.ProductType;

				expect(result).to.be.equal(expectedResult);
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

					expect(result).to.be.equal(expectedResult);
				});
			});

			describe(`LimitationMaxRaw for ${ParameterActive[parameterActive]}`, function () {
				it("should return the node's limitation max raw value", function () {
					const expectedResult = 0xc800;
					const result = product.getLimitationMaxRaw(parameterActive);

					expect(result).to.be.equal(expectedResult);
				});
			});
		}

		describe("getLimitations", function () {
			it("should return [0.5, 0.25] for a window", function () {
				const expectedResult = [0.5, 0.25];

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x9600);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.WindowOpener;
				});

				const result = product.getLimitations(ParameterActive.MP);

				expect(result).to.be.deep.equal(expectedResult);
			});

			it("should return [0.25, 0.5] for a roller shutter", function () {
				const expectedResult = [0.25, 0.5];

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x3200);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.RollerShutter;
				});

				const result = product.getLimitations(ParameterActive.MP);

				expect(result).to.be.deep.equal(expectedResult);
			});
		});

		describe("getLimitationMin", function () {
			it("should return 0.5 for a window", function () {
				const expectedResult = 0.5;

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x9600);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.WindowOpener;
				});

				const result = product.getLimitationMin(ParameterActive.MP);

				expect(result).to.be.equal(expectedResult);
			});

			it("should return 0.25 for a roller shutter", function () {
				const expectedResult = 0.25;

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x3200);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.RollerShutter;
				});

				const result = product.getLimitationMin(ParameterActive.MP);

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("getLimitationMax", function () {
			it("should return 0.25 for a window", function () {
				const expectedResult = 0.25;

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x9600);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.WindowOpener;
				});

				const result = product.getLimitationMax(ParameterActive.MP);

				expect(result).to.be.equal(expectedResult);
			});

			it("should return 0.5 for a roller shutter", function () {
				const expectedResult = 0.5;

				// Mock the expected raw values:
				sinon.stub(product, "getLimitationMinRaw").withArgs(ParameterActive.MP).returns(0x3200);
				sinon.stub(product, "getLimitationMaxRaw").withArgs(ParameterActive.MP).returns(0x6400);
				sinon.stub(product, "TypeID").get(() => {
					return ActuatorType.RollerShutter;
				});

				const result = product.getLimitationMax(ParameterActive.MP);

				expect(result).to.be.equal(expectedResult);
			});
		});

		describe("setNameAsync", function () {
			it("should send a set node name request", async function () {
				const result = product.setNameAsync("New name");

				await expect(result).to.be.fulfilled;
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("setNodeVariationAsync", function () {
			it("should send a set node variation request", async function () {
				const result = product.setNodeVariationAsync(NodeVariation.Kip);

				await expect(result).to.be.fulfilled;
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("setOrderAndPlacementAsync", function () {
			it("should send a set order and placement request", async function () {
				const result = product.setOrderAndPlacementAsync(1, 2);

				await expect(result).to.be.fulfilled;
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("setOrderAsync", function () {
			it("should call setOrderAndPlacementAsync", async function () {
				const expectedResult = 42;
				const setOrderAndPlacementAsyncStub = sandbox.stub(product, "setOrderAndPlacementAsync").resolves();

				const result = product.setOrderAsync(expectedResult);
				expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(expectedResult, product.Placement);
				await expect(result).to.be.fulfilled;
			});
		});

		describe("setPlacementAsync", function () {
			it("should call setOrderAndPlacementAsync", async function () {
				const expectedResult = 42;
				const setOrderAndPlacementAsyncStub = sandbox.stub(product, "setOrderAndPlacementAsync").resolves();

				const result = product.setPlacementAsync(expectedResult);
				expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(product.Order, expectedResult);
				await expect(result).to.be.fulfilled;
			});
		});

		describe("setTargetPositionAsync", function () {
			it("should send a command request", async function () {
				const result = product.setTargetPositionAsync(0.42);

				await expect(result).to.be.eventually.equal(getNextSessionID() - 1);
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("setTargetPositionRawAsync", function () {
			it("should send a command request", async function () {
				const result = product.setTargetPositionRawAsync(0x4711);

				await expect(result).to.be.eventually.equal(getNextSessionID() - 1);
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("stopAsync", function () {
			it("should send a command request", async function () {
				const result = product.stopAsync();

				await expect(result).to.be.eventually.equal(getNextSessionID() - 1);
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("winkAsync", function () {
			it("should send a command request", async function () {
				const result = product.winkAsync();

				await expect(result).to.be.eventually.equal(getNextSessionID() - 1);
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("refreshAsync", function () {
			it("should send a command request", async function () {
				const result = product.refreshAsync();

				await expect(result).to.be.fulfilled;
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("refreshLimitation", function () {
			it("should notify LimitationMinRaw change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationMinRaw");
			});

			it("should notify LimitationMaxRaw change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationMaxRaw");
			});

			it("should notify LimitationOriginator change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationOriginator");
			});

			it("should notify LimitationOriginatorMin change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationOriginatorMin");
			});

			it("should notify LimitationOriginatorMax change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationOriginatorMax");
			});

			it("should notify LimitationTimeRaw change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationTimeRaw");
			});

			it("should notify LimitationTimeRawMin change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationTimeRawMin");
			});

			it("should notify LimitationTimeRawMax change", async function () {
				const notifyChange = sinon.stub();
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

				expect(notifyChange).to.be.calledWith("LimitationTimeRawMax");
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

				expect(product.getLimitationOriginator(ParameterActive.MP)).to.be.equal(CommandOriginator.Rain);
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

				expect(product.getLimitationOriginatorMin(ParameterActive.MP)).to.be.equal(CommandOriginator.Rain);
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

				expect(product.getLimitationOriginatorMax(ParameterActive.MP)).to.be.equal(CommandOriginator.Rain);
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

				expect(product.getLimitationTime(ParameterActive.MP)).to.be.equal(60);
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

				expect(product.getLimitationTimeMin(ParameterActive.MP)).to.be.equal(60);
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

				expect(product.getLimitationTimeMax(ParameterActive.MP)).to.be.equal(60);
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

				await expect(result).to.be.rejectedWith(Error);
			});

			it("should wait until GW_SESSION_FINISHED_NTF", async function () {
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
				const sessionFinishedSpy = sinon.spy();
				const waitPromise = new Promise<void>((resolve) => {
					conn.on(() => {
						sessionFinishedSpy();
						resolve();
					}, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
				});

				try {
					await product.refreshLimitationAsync(LimitationType.MaximumLimitation, ParameterActive.MP);

					expect(sessionFinishedSpy).to.be.calledOnce;
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

				await expect(refreshLimitationPromise).to.be.rejectedWith(Error);
			});

			it("should reject on inconsistent return values (wrong node ID) and wait until GW_SESSION_FINISHED_NTF", async function () {
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

				const sessionFinishedSpy = sinon.spy();
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

					await expect(refreshLimitationPromise).to.be.rejectedWith(Error);

					expect(sessionFinishedSpy).to.be.calledOnce;
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

				await expect(refreshLimitationPromise).to.be.rejectedWith(Error);
			});

			it("should reject on inconsistent return values (wrong parameter ID) and wait until GW_SESSION_FINISHED_NTF", async function () {
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

				const sessionFinishedSpy = sinon.spy();
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

					await expect(refreshLimitationPromise).to.be.rejectedWith(Error);

					expect(sessionFinishedSpy).to.be.calledOnce;
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

				await expect(result).to.be.fulfilled;
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

				await expect(result).to.be.rejectedWith(Error);
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

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("clearLimitationAsync", function () {
			it("should call setLimitationRawAsync", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				await product.clearLimitationAsync();

				expect(spySetLimitationRawAsync).to.be.calledOnceWith(
					0xd400,
					0xd400,
					ParameterActive.MP,
					255,
					CommandOriginator.SAAC,
					PriorityLevel.ComfortLevel2,
				);
			});
		});

		describe("setLimitationAsync", function () {
			it("should call setLimitationRawAsync", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				await product.setLimitationAsync(0.25, 0.5);

				expect(spySetLimitationRawAsync).to.be.calledOnceWith(
					0x6400,
					0x9600,
					ParameterActive.MP,
					253,
					CommandOriginator.SAAC,
					PriorityLevel.ComfortLevel2,
				);
			});

			it("should throw if minValue > maxValue", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				const result = product.setLimitationAsync(0.5, 0.25);

				await expect(result).to.be.rejectedWith(Error);
			});

			it("should throw if minValue < 0", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				const result = product.setLimitationAsync(-1, 0.25);

				await expect(result).to.be.rejectedWith(Error);
			});

			it("should throw if minValue > 1", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				const result = product.setLimitationAsync(1, 1.25);

				await expect(result).to.be.rejectedWith(Error);
			});

			it("should throw if maxValue < 0", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				const result = product.setLimitationAsync(-1, -0.25);

				await expect(result).to.be.rejectedWith(Error);
			});

			it("should throw if maxValue > 0", async function () {
				const spySetLimitationRawAsync = sinon.spy(() => {
					return Promise.resolve();
				});
				sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

				const result = product.setLimitationAsync(0.25, 1.25);

				await expect(result).to.be.rejectedWith(Error);
			});
		});

		describe("onNotificationHandler", function () {
			let propertyChangedSpy: SinonSpy<PropertyChangedEvent[]>;

			this.beforeEach(function () {
				propertyChangedSpy = sandbox.spy() as sinon.SinonSpy<PropertyChangedEvent[], any>;
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

					expect(propertyChangedSpy, "Name").to.be.calledWith({
						o: product,
						propertyName: "Name",
						propertyValue: "Dummy",
					});
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

					expect(propertyChangedSpy, "NodeVariation").to.be.calledWith({
						o: product,
						propertyName: "NodeVariation",
						propertyValue: NodeVariation.FlatRoof,
					});
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

					expect(propertyChangedSpy, "Order").to.be.calledWith({
						o: product,
						propertyName: "Order",
						propertyValue: 2,
					});
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

					expect(propertyChangedSpy, "Placement").to.be.calledWith({
						o: product,
						propertyName: "Placement",
						propertyValue: 3,
					});
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

					expect(propertyChangedSpy, "Name").to.be.calledOnceWith({
						o: product,
						propertyName: "Name",
						propertyValue: "Dummy",
					});
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

					expect(propertyChangedSpy).not.to.be.called;
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

					expect(propertyChangedSpy, "State").to.be.calledWith({
						o: product,
						propertyName: "State",
						propertyValue: NodeOperatingState.Executing,
					});
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

					expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "CurrentPositionRaw",
						propertyValue: 0xc000,
					});
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

					expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith({
						o: product,
						propertyName: "CurrentPosition",
						propertyValue: 0.040000000000000036,
					});
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

					expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "TargetPositionRaw",
						propertyValue: 0xc700,
					});
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

					expect(propertyChangedSpy, "TargetPosition").to.be.calledWith({
						o: product,
						propertyName: "TargetPosition",
						propertyValue: 0.0050000000000000044,
					});
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

					expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "FP1CurrentPositionRaw",
						propertyValue: 0xf7fe,
					});
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

					expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "FP2CurrentPositionRaw",
						propertyValue: 0xf7fe,
					});
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

					expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "FP3CurrentPositionRaw",
						propertyValue: 0xf7fe,
					});
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

					expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "FP4CurrentPositionRaw",
						propertyValue: 0xf7fe,
					});
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

					expect(propertyChangedSpy, "RemainingTime").to.be.calledWith({
						o: product,
						propertyName: "RemainingTime",
						propertyValue: 5,
					});
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

					expect(propertyChangedSpy).not.to.be.called;
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

						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith({
							o: product,
							propertyName: "CurrentPosition",
							propertyValue: 0.040000000000000036,
						});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "FP1CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "FP2CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "FP3CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "FP4CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

					expect(propertyChangedSpy).not.to.be.called;
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

					expect(propertyChangedSpy, "RemainingTime").to.be.calledWith({
						o: product,
						propertyName: "RemainingTime",
						propertyValue: 42,
					});
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

					expect(propertyChangedSpy).not.to.be.called;
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

					expect(propertyChangedSpy).not.to.be.called;
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

					expect(propertyChangedSpy, "Order").to.be.calledOnceWith({
						o: product,
						propertyName: "Order",
						propertyValue: 2,
					});
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

					expect(propertyChangedSpy, "Placement").to.be.calledOnceWith({
						o: product,
						propertyName: "Placement",
						propertyValue: 2,
					});
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
					expect(propertyChangedSpy, "Name").to.be.calledOnceWith({
						o: product,
						propertyName: "Name",
						propertyValue: "Window 1 changed",
					});
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

					expect(propertyChangedSpy, "Velocity").to.be.calledOnceWith({
						o: product,
						propertyName: "Velocity",
						propertyValue: Velocity.Fast,
					});
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

					expect(propertyChangedSpy, "TypeID").to.be.calledOnceWith({
						o: product,
						propertyName: "TypeID",
						propertyValue: ActuatorType.RollerShutter,
					});
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

					expect(propertyChangedSpy, "SubType").to.be.calledOnceWith({
						o: product,
						propertyName: "SubType",
						propertyValue: 0,
					});
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

					expect(propertyChangedSpy, "ProductType").to.be.calledOnceWith({
						o: product,
						propertyName: "ProductType",
						propertyValue: 6,
					});
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

					expect(propertyChangedSpy, "NodeVariation").to.be.calledOnceWith({
						o: product,
						propertyName: "NodeVariation",
						propertyValue: NodeVariation.TopHung,
					});
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

					expect(propertyChangedSpy, "PowerSaveMode").to.be.calledOnceWith({
						o: product,
						propertyName: "PowerSaveMode",
						propertyValue: PowerSaveMode.AlwaysAlive,
					});
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

					expect(propertyChangedSpy, "SerialNumber").to.be.calledOnceWith({
						o: product,
						propertyName: "SerialNumber",
						propertyValue: Buffer.from([12, 34, 56, 78, 12, 34, 56, 78]),
					});
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

					expect(propertyChangedSpy, "State").to.be.calledOnceWith({
						o: product,
						propertyName: "State",
						propertyValue: NodeOperatingState.WaitingForPower,
					});
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

					expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "CurrentPositionRaw",
						propertyValue: 0,
					});
					expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith({
						o: product,
						propertyName: "CurrentPosition",
						propertyValue: 1,
					});
					expect(propertyChangedSpy).to.be.calledTwice;
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

					expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWith({
						o: product,
						propertyName: "TargetPositionRaw",
						propertyValue: 0,
					});
					expect(propertyChangedSpy, "TargetPosition").to.be.calledWith({
						o: product,
						propertyName: "TargetPosition",
						propertyValue: 1,
					});
					expect(propertyChangedSpy).to.be.calledTwice;
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

					expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledOnceWith({
						o: product,
						propertyName: "FP1CurrentPositionRaw",
						propertyValue: 0,
					});
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

					expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledOnceWith({
						o: product,
						propertyName: "FP2CurrentPositionRaw",
						propertyValue: 0,
					});
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

					expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledOnceWith({
						o: product,
						propertyName: "FP3CurrentPositionRaw",
						propertyValue: 0,
					});
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

					expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledOnceWith({
						o: product,
						propertyName: "FP4CurrentPositionRaw",
						propertyValue: 0,
					});
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

					expect(propertyChangedSpy, "RemainingTime").to.be.calledOnceWith({
						o: product,
						propertyName: "RemainingTime",
						propertyValue: 1,
					});
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

					expect(propertyChangedSpy, "TimeStamp").to.be.calledOnceWith({
						o: product,
						propertyName: "TimeStamp",
						propertyValue: new Date(expectedTimeStamp * 1000),
					});
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

					expect(propertyChangedSpy, "ProductAlias").to.be.calledOnceWith({
						o: product,
						propertyName: "ProductAlias",
						propertyValue: [new ActuatorAlias(0xd803, 0xba01)],
					});
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "CurrentPositionRaw",
							propertyValue: 0xc000,
						});
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

						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith({
							o: product,
							propertyName: "CurrentPosition",
							propertyValue: 0.040000000000000036,
						});
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

						expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "TargetPositionRaw",
							propertyValue: 0xc700,
						});
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

						expect(propertyChangedSpy, "TargetPosition").to.be.calledWith({
							o: product,
							propertyName: "TargetPosition",
							propertyValue: 0.0050000000000000044,
						});
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

						expect(propertyChangedSpy, "RemainingTime").to.be.calledWith({
							o: product,
							propertyName: "RemainingTime",
							propertyValue: 5,
						});
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

						expect(propertyChangedSpy).not.to.be.called;
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "TargetPositionRaw",
							propertyValue: 0xc700,
						});
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

						expect(propertyChangedSpy, "TargetPosition").to.be.calledWith({
							o: product,
							propertyName: "TargetPosition",
							propertyValue: 0.0050000000000000044,
						});
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

						expect(propertyChangedSpy).not.to.be.called;
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "CurrentPositionRaw",
							propertyValue: 0xc700,
						});
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

						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith({
							o: product,
							propertyName: "CurrentPosition",
							propertyValue: 0.0050000000000000044,
						});
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

						expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWith({
							o: product,
							propertyName: "FP2CurrentPositionRaw",
							propertyValue: 0xc700,
						});
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

						expect(propertyChangedSpy).not.to.be.called;
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

						expect(propertyChangedSpy, "RunStatus").to.be.calledWith({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
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

						expect(propertyChangedSpy, "StatusReply").to.be.calledWith({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
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

						expect(propertyChangedSpy, "RemainingTime").to.be.calledWith({
							o: product,
							propertyName: "RemainingTime",
							propertyValue: 5,
						});
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

						expect(propertyChangedSpy).not.to.be.called;
					});
				});
			});
		});
	});
});
