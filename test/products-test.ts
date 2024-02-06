"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { SinonSandbox, SinonSpy } from "sinon";
import sinonChai from "sinon-chai";
import {
	ActuatorType,
	CommandOriginator,
	GW_COMMAND_REMAINING_TIME_NTF,
	GW_COMMAND_RUN_STATUS_NTF,
	GW_COMMAND_SEND_CFM,
	GW_CS_SYSTEM_TABLE_UPDATE_NTF,
	GW_ERROR_NTF,
	GW_GET_ALL_NODES_INFORMATION_CFM,
	GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF,
	GW_GET_ALL_NODES_INFORMATION_NTF,
	GW_GET_LIMITATION_STATUS_CFM,
	GW_GET_NODE_INFORMATION_CFM,
	GW_GET_NODE_INFORMATION_NTF,
	GW_LIMITATION_STATUS_NTF,
	GW_NODE_INFORMATION_CHANGED_NTF,
	GW_NODE_STATE_POSITION_CHANGED_NTF,
	GW_SESSION_FINISHED_NTF,
	GW_SET_LIMITATION_CFM,
	GW_SET_NODE_NAME_CFM,
	GW_SET_NODE_ORDER_AND_PLACEMENT_CFM,
	GW_SET_NODE_VARIATION_CFM,
	GW_WINK_SEND_CFM,
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
	Velocity,
} from "../src";
import { PropertyChangedEvent } from "../src/utils/PropertyChangedEvent";
import { MockConnection } from "./mocks/mockConnection";

use(chaiAsPromised);
use(sinonChai);

describe("products", function () {
	// Setup sinon sandbox
	let sandbox: SinonSandbox;

	this.beforeEach(function () {
		sandbox = sinon.createSandbox();
	});

	this.afterEach(function () {
		sandbox.restore();
	});

	describe("Products class", function () {
		// Error frame
		const dataError = Buffer.from([0x04, 0x00, 0x00, 0x07]);
		const dataErrorNtf = new GW_ERROR_NTF(dataError);

		// Frames for products list
		const dataAllNodes = Buffer.from([0x05, 0x02, 0x03, 0x00, 0x05]);
		const dataAllNodesCfm = new GW_GET_ALL_NODES_INFORMATION_CFM(dataAllNodes);
		// Frames for empty products list
		const dataAllNodesEmptyProductsList = Buffer.from([0x05, 0x02, 0x03, 0x00, 0x00]);
		const dataAllNodesCfmEmptyProductsList = new GW_GET_ALL_NODES_INFORMATION_CFM(dataAllNodesEmptyProductsList);

		const dataNodes = [
			Buffer.from([
				0x7f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x01, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42, 0x61,
				0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00,
				0x4f, 0x00, 0x3f, 0xf3, 0x01, 0xd8, 0x03, 0xb2, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			]),
			Buffer.from([
				0x7f, 0x02, 0x04, 0x01, 0x00, 0x01, 0x02, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x53, 0x63,
				0x68, 0x6c, 0x61, 0x66, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00,
				0x4f, 0x00, 0x3f, 0xf3, 0x02, 0xd8, 0x02, 0x64, 0x00, 0xd8, 0x03, 0xba, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			]),
			Buffer.from([
				0x7f, 0x02, 0x04, 0x02, 0x00, 0x02, 0x03, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x41, 0x6e,
				0x6b, 0x6c, 0x65, 0x69, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00,
				0x4f, 0x00, 0x3f, 0xf3, 0x02, 0xd8, 0x02, 0x64, 0x00, 0xd8, 0x03, 0xba, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			]),
			Buffer.from([
				0x7f, 0x02, 0x04, 0x03, 0x00, 0x03, 0x02, 0x52, 0x6f, 0x6c, 0x6c, 0x6c, 0x61, 0x64, 0x65, 0x6e, 0x20,
				0x53, 0x63, 0x68, 0x6c, 0x61, 0x66, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x01, 0x00, 0x80, 0xd5, 0x05, 0x00, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00,
				0x4f, 0x00, 0x3f, 0xf3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			]),
			Buffer.from([
				0x7f, 0x02, 0x04, 0x04, 0x00, 0x04, 0x04, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42, 0xc3,
				0xbc, 0x72, 0x6f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x05, 0xc8, 0x00, 0xc8, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00,
				0x4f, 0x00, 0x3f, 0xf3, 0x02, 0xd8, 0x02, 0x64, 0x00, 0xd8, 0x03, 0xba, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			]),
		];
		const dataNodesNtf: GW_GET_ALL_NODES_INFORMATION_NTF[] = [];
		dataNodes.forEach((dataNode) => {
			dataNodesNtf.push(new GW_GET_ALL_NODES_INFORMATION_NTF(dataNode));
		});
		const dataNodeFinish = Buffer.from([0x03, 0x02, 0x05]);
		const dataNodeFinishNtf = new GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF(dataNodeFinish);

		const receivedFrames = [dataAllNodesCfm];

		const receivedFramesEmptyProductsList = [dataAllNodesCfmEmptyProductsList];

		describe("createProductsAsync", function () {
			this.beforeEach(function () {
				sandbox.stub(Product.prototype, "refreshLimitationAsync").resolves();
			});

			it("should create without error with 5 products.", async function () {
				const conn = new MockConnection(receivedFrames);
				const promResult = Products.createProductsAsync(conn);
				// Send nodes
				for (const dataNodeNtf of dataNodesNtf) {
					conn.sendNotification(dataNodeNtf, []);
				}
				// Send finished
				conn.sendNotification(dataNodeFinishNtf, []);
				const result = await promResult;
				expect(result).to.be.instanceOf(Products);
				expect(result.Products.length).to.be.equal(5);
			});

			it("should throw an error on invalid frames.", async function () {
				const conn = new MockConnection([]);
				return expect(Products.createProductsAsync(conn)).to.rejectedWith(Error);
			});

			it("should create without error without products.", async function () {
				const conn = new MockConnection(receivedFramesEmptyProductsList);
				const promResult = Products.createProductsAsync(conn);
				const result = await promResult;
				expect(result).to.be.instanceOf(Products);
				expect(result.Products.length).to.be.equal(0);
			});
		});

		describe("findByName", function () {
			this.beforeEach(function () {
				sandbox.stub(Product.prototype, "refreshLimitationAsync").resolves();
			});

			it("should find product 'Fenster Badezimmer'.", async function () {
				const conn = new MockConnection(receivedFrames);
				const promProducts = Products.createProductsAsync(conn);
				// Send nodes
				for (const dataNodeNtf of dataNodesNtf) {
					conn.sendNotification(dataNodeNtf, []);
				}
				// Send finished
				conn.sendNotification(dataNodeFinishNtf, []);
				const products = await promProducts;
				const result = products.findByName("Fenster Badezimmer");
				expect(result).to.be.instanceOf(Product).with.property("Name", "Fenster Badezimmer");
			});
		});

		describe("onNotificationHandler", function () {
			this.beforeEach(function () {
				sandbox.stub(Product.prototype, "refreshLimitationAsync").resolves();
			});

			it("should add 1 product and remove 2 products.", async function () {
				const data = Buffer.from([
					55, 0x01, 0x12,
					// Added nodes (0)
					1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Removed nodes (0, 1)
					3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const dataNtf = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);
				const dataNodeInformation = Buffer.from([0x05, 0x02, 0x01, 0x00, 0x00]);
				const dataNodeInformationCfm = new GW_GET_NODE_INFORMATION_CFM(dataNodeInformation);
				const dataNodeInfoNotification = Buffer.from([
					0x7f, 0x02, 0x10, 0x00, 0x00, 0x00, 0x01, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42,
					0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x16, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x66, 0x00, 0x66, 0x00, 0xf7, 0xff, 0xf7, 0xff,
					0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00, 0x4f, 0x00, 0x4c, 0x93, 0x01, 0xd8, 0x03, 0xb2, 0x1c, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				]);
				const dataNodeInfoNotificationNtf = new GW_GET_NODE_INFORMATION_NTF(dataNodeInfoNotification);

				const conn = new MockConnection(receivedFrames);
				const promProducts = Products.createProductsAsync(conn);
				for (const dataNodeNtf of dataNodesNtf) {
					conn.sendNotification(dataNodeNtf, []);
				}
				// Send finished
				conn.sendNotification(dataNodeFinishNtf, []);
				const products = await promProducts;

				// Setups spies for counting notifications
				const productAddedSpy = sinon.spy();
				const productRemovedSpy = sinon.spy();
				products.onNewProduct((productID) => {
					productAddedSpy(productID);
				});
				products.onRemovedProduct((productID) => {
					productRemovedSpy(productID);
				});

				conn.sendNotification(dataNtf, [dataNodeInformationCfm]);
				conn.sendNotification(dataNodeInfoNotificationNtf, []);

				// Just let the asynchronous stuff run before our checks
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});

				expect(
					productAddedSpy.calledOnce,
					`onNewProduct should be called once. Instead it was called ${productAddedSpy.callCount} times.`,
				).to.be.true;
				expect(
					productRemovedSpy.calledTwice,
					`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.callCount} times.`,
				).to.be.true;
			});
		});

		describe("addNodeAsync", function () {
			this.beforeEach(function () {
				sandbox.stub(Product.prototype, "refreshLimitationAsync").resolves();
			});

			it("should throw on error frame.", async function () {
				const data = Buffer.from([
					55, 0x01, 0x12,
					// Added nodes (0)
					1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					// Removed nodes (0, 1)
					3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				]);
				const dataNtf = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);

				const conn = new MockConnection(receivedFrames);
				const promProducts = Products.createProductsAsync(conn);
				for (const dataNodeNtf of dataNodesNtf) {
					conn.sendNotification(dataNodeNtf, []);
				}
				// Send finished
				conn.sendNotification(dataNodeFinishNtf, []);
				const products = await promProducts;

				// Setups spies for counting notifications
				const productAddedSpy = sinon.spy();
				const productRemovedSpy = sinon.spy();
				products.onNewProduct((productID) => {
					productAddedSpy(productID);
				});
				products.onRemovedProduct((productID) => {
					productRemovedSpy(productID);
				});

				conn.sendNotification(dataNtf, [dataErrorNtf]);

				// Just let the asynchronous stuff run before our checks
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});

				expect(
					productAddedSpy.notCalled,
					`onNewProduct shouldn't be called at all. Instead it was called ${productAddedSpy.callCount} times.`,
				).to.be.true;
				expect(
					productRemovedSpy.calledTwice,
					`onRemovedProduct should be called twice. Instead it was called ${productRemovedSpy.callCount} times.`,
				).to.be.true;
			});
		});

		describe("Product class", function () {
			/* Setup is the same for all test cases */
			let conn: MockConnection;
			let products: Products;
			let product: Product;
			this.beforeEach(async () => {
				conn = new MockConnection(receivedFrames);
				const promResult = Products.createProductsAsync(conn);
				// Send nodes
				for (const dataNodeNtf of dataNodesNtf) {
					conn.sendNotification(dataNodeNtf, []);
				}
				// Send finished
				conn.sendNotification(dataNodeFinishNtf, []);

				const stubRefreshLimitationAsync = sandbox.stub(Product.prototype, "refreshLimitationAsync").resolves();

				products = await promResult;
				product = products.Products[0]; // Use the first product for all tests

				stubRefreshLimitationAsync.restore();
			});

			describe("Name", function () {
				it("should return the product name", function () {
					const expectedResult = "Fenster Badezimmer";
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
						const dataTest = Buffer.from(dataNodes[0]);
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
					const expectedResult = NodeVariation.NotSet;
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
					const expectedResult = 1;
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
					const expectedResult = Velocity.Silent;
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
					const expectedResult = 7;
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
				it("should return [0.25, 0.5] for a window", function () {
					const expectedResult = [0.25, 0.5];

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
				it("should return 0.25 for a window", function () {
					const expectedResult = 0.25;

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
				it("should return 0.5 for a window", function () {
					const expectedResult = 0.5;

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
					const data = Buffer.from([0x05, 0x02, 0x09, 0x00, 0]);
					const dataCfm = new GW_SET_NODE_NAME_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setNameAsync("New name");

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x05, 0x02, 0x09, 0x01, 0]);
					const dataCfm = new GW_SET_NODE_NAME_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setNameAsync("New name");

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setNameAsync("New name");

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setNodeVariationAsync", function () {
				it("should send a set node variation request", async function () {
					const data = Buffer.from([0x05, 0x02, 0x07, 0x00, 0]);
					const dataCfm = new GW_SET_NODE_VARIATION_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setNodeVariationAsync(NodeVariation.Kip);

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x05, 0x02, 0x07, 0x01, 0]);
					const dataCfm = new GW_SET_NODE_VARIATION_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setNodeVariationAsync(NodeVariation.Kip);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setNodeVariationAsync(NodeVariation.Kip);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setOrderAndPlacementAsync", function () {
				it("should send a set order and placement request", async function () {
					const data = Buffer.from([0x05, 0x02, 0x0e, 0x00, 0]);
					const dataCfm = new GW_SET_NODE_ORDER_AND_PLACEMENT_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setOrderAndPlacementAsync(1, 2);

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x05, 0x02, 0x0e, 0x01, 0]);
					const dataCfm = new GW_SET_NODE_ORDER_AND_PLACEMENT_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setOrderAndPlacementAsync(1, 2);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setOrderAndPlacementAsync(1, 2);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setOrderAsync", function () {
				it("should call setOrderAndPlacementAsync", async function () {
					const expectedResult = 42;
					const setOrderAndPlacementAsyncStub = sandbox.stub(product, "setOrderAndPlacementAsync").resolves();

					const result = product.setOrderAsync(expectedResult);
					expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(
						expectedResult,
						product.Placement,
					);
					return expect(result).to.be.fulfilled;
				});
			});

			describe("setPlacementAsync", function () {
				it("should call setOrderAndPlacementAsync", async function () {
					const expectedResult = 42;
					const setOrderAndPlacementAsyncStub = sandbox.stub(product, "setOrderAndPlacementAsync").resolves();

					const result = product.setPlacementAsync(expectedResult);
					expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(product.Order, expectedResult);
					return expect(result).to.be.fulfilled;
				});
			});

			describe("setTargetPositionAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setTargetPositionAsync(0.42);

					return expect(result).to.be.eventually.equal(0x4711);
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setTargetPositionAsync(0.42);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setTargetPositionAsync(0.42);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setTargetPositionRawAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setTargetPositionRawAsync(0x4711);

					return expect(result).to.be.eventually.equal(0x4711);
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setTargetPositionRawAsync(0x4711);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setTargetPositionRawAsync(0x4711);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("stopAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.stopAsync();

					return expect(result).to.be.eventually.equal(0x4711);
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
					const dataCfm = new GW_COMMAND_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.stopAsync();

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.stopAsync();

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("winkAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
					const dataCfm = new GW_WINK_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.winkAsync();

					return expect(result).to.be.eventually.equal(0x4711);
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x00]);
					const dataCfm = new GW_WINK_SEND_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.winkAsync();

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.winkAsync();

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("refreshAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x05, 0x02, 0x01, 0x00, 0x00]);
					const dataCfm = new GW_GET_NODE_INFORMATION_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.refreshAsync();

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x05, 0x02, 0x01, 0x01, 0x00]);
					const dataCfm = new GW_GET_NODE_INFORMATION_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.refreshAsync();

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.refreshAsync();

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("refreshLimitation", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x13, 0x00, 0x00, 0x01]);
					const dataCfm = new GW_GET_LIMITATION_STATUS_CFM(data);
					const dataNotification = Buffer.from([13, 0x03, 0x14, 0, 0, 0, 0, 247, 255, 100, 0, 255, 255]);
					const dataNotificationNtf = new GW_LIMITATION_STATUS_NTF(dataNotification);
					const dataCommandRunStatus = Buffer.from([
						16, 0x03, 0x02, 0, 0, 1, 0, 0, 100, 0, 0, 1, 42, 0, 0, 0,
					]);
					const dataCommandRunStatusNtf = new GW_COMMAND_RUN_STATUS_NTF(dataCommandRunStatus);
					const dataSessionFinished = Buffer.from([5, 0x03, 0x04, 0, 0]);
					const dataSessionFinishedNtf = new GW_SESSION_FINISHED_NTF(dataSessionFinished);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.refreshLimitationAsync(LimitationType.MaximumLimitation);

					// Just let the asynchronous stuff run before our checks
					await new Promise((resolve) => {
						setTimeout(resolve, 0);
					});

					conn.sendNotification(dataNotificationNtf, []);
					conn.sendNotification(dataCommandRunStatusNtf, []);
					conn.sendNotification(dataSessionFinishedNtf, []);

					// Just let the asynchronous stuff run before our checks
					await new Promise((resolve) => {
						setTimeout(resolve, 0);
					});

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x13, 0x00, 0x00, 0x00]);
					const dataCfm = new GW_GET_LIMITATION_STATUS_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.refreshLimitationAsync(LimitationType.MaximumLimitation);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("setLimitationRawAsync", function () {
				it("should send a command request", async function () {
					const data = Buffer.from([0x06, 0x03, 0x11, 0x00, 0x00, 0x01]);
					const dataCfm = new GW_SET_LIMITATION_CFM(data);
					const dataNotification = Buffer.from([13, 0x03, 0x14, 0, 0, 0, 0, 50, 0, 100, 0, 8, 0]);
					const dataNotificationNtf = new GW_LIMITATION_STATUS_NTF(dataNotification);
					const dataCommandRunStatus = Buffer.from([
						16, 0x03, 0x02, 0, 0, 1, 0, 0, 100, 0, 0, 1, 42, 0, 0, 0,
					]);
					const dataCommandRunStatusNtf = new GW_COMMAND_RUN_STATUS_NTF(dataCommandRunStatus);
					const dataSessionFinished = Buffer.from([5, 0x03, 0x04, 0, 0]);
					const dataSessionFinishedNtf = new GW_SESSION_FINISHED_NTF(dataSessionFinished);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setLimitationRawAsync(0, 0x6400);

					// Just let the asynchronous stuff run before our checks
					await new Promise((resolve) => {
						setTimeout(resolve, 0);
					});

					conn.sendNotification(dataNotificationNtf, []);
					conn.sendNotification(dataCommandRunStatusNtf, []);
					conn.sendNotification(dataSessionFinishedNtf, []);

					// Just let the asynchronous stuff run before our checks
					await new Promise((resolve) => {
						setTimeout(resolve, 0);
					});

					return expect(result).to.be.fulfilled;
				});

				it("should reject on error status", async function () {
					const data = Buffer.from([0x06, 0x03, 0x11, 0x00, 0x00, 0x00]);
					const dataCfm = new GW_SET_LIMITATION_CFM(data);

					// Mock request
					conn.valueToReturn.push(dataCfm);

					const result = product.setLimitationRawAsync(0, 0x6400);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should reject on error frame", async function () {
					// Mock request
					conn.valueToReturn.push(dataErrorNtf);

					const result = product.setLimitationRawAsync(0, 0x6400);

					return expect(result).to.be.rejectedWith(Error);
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

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should throw if minValue < 0", async function () {
					const spySetLimitationRawAsync = sinon.spy(() => {
						return Promise.resolve();
					});
					sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

					const result = product.setLimitationAsync(-1, 0.25);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should throw if minValue > 1", async function () {
					const spySetLimitationRawAsync = sinon.spy(() => {
						return Promise.resolve();
					});
					sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

					const result = product.setLimitationAsync(1, 1.25);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should throw if maxValue < 0", async function () {
					const spySetLimitationRawAsync = sinon.spy(() => {
						return Promise.resolve();
					});
					sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

					const result = product.setLimitationAsync(-1, -0.25);

					return expect(result).to.be.rejectedWith(Error);
				});

				it("should throw if maxValue > 0", async function () {
					const spySetLimitationRawAsync = sinon.spy(() => {
						return Promise.resolve();
					});
					sinon.stub(product, "setLimitationRawAsync").callsFake(spySetLimitationRawAsync);

					const result = product.setLimitationAsync(0.25, 1.25);

					return expect(result).to.be.rejectedWith(Error);
				});
			});

			describe("onNotificationHandler", function () {
				let propertyChangedSpy: SinonSpy<PropertyChangedEvent[]>;

				this.beforeEach(function () {
					propertyChangedSpy = sandbox.spy();
					product.propertyChangedEvent.on((event) => {
						propertyChangedSpy(event);
					});
				});

				describe("GW_NODE_INFORMATION_CHANGED_NTF", function () {
					it("should send notifications for Name, NodeVariation, Order and Placement", function () {
						// prettier-ignore
						const data = Buffer.from([
							72, 0x02, 0x0c, 
                            // Node ID
                            0,
                            // Name
                            0x44, 0x75, 0x6d, 0x6d, 0x79, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            // Order
                            0x00, 0x02,
                            // Placement
                            3,
                            // Node Variation
                            2  // KIP
                        ]);
						const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Name").to.be.calledWithMatch({
							o: product,
							propertyName: "Name",
							propertyValue: "Dummy",
						});
						expect(propertyChangedSpy, "NodeVariation").to.be.calledWithMatch({
							o: product,
							propertyName: "NodeVariation",
							propertyValue: NodeVariation.Kip,
						});
						expect(propertyChangedSpy, "Order").to.be.calledWithMatch({
							o: product,
							propertyName: "Order",
							propertyValue: 2,
						});
						expect(propertyChangedSpy, "Placement").to.be.calledWithMatch({
							o: product,
							propertyName: "Placement",
							propertyValue: 3,
						});
					});

					it("should send notifications for Name only", function () {
						const data = Buffer.from([
							72, 0x02, 0x0c,
							// Node ID
							0,
							// Name
							0x44, 0x75, 0x6d, 0x6d, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00,
							// Order
							0x00, 0x00,
							// Placement
							1,
							// Node Variation
							0,
						]);
						const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Name").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "Name", propertyValue: "Dummy" }),
						);
					});

					it("shouldn't send any notifications", function () {
						const data = Buffer.from([
							72, 0x02, 0x0c,
							// Node ID
							0,
							// Name
							0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d,
							0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00,
							// Order
							0x00, 0x00,
							// Placement
							1,
							// Node Variation
							0,
						]);
						const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy).not.to.be.called;
					});
				});

				describe("GW_NODE_STATE_POSITION_CHANGED_NTF", function () {
					it("should send notifications for State, CurrentPositionRaw, CurrentPosition, TargetPositionRaw, TargetPosition, FP1CurrentPositionRaw, FP2CurrentPositionRaw, FP3CurrentPositionRaw, FP4CurrentPositionRaw, RemainingTime, TimeStamp", function () {
						// prettier-ignore
						const data = Buffer.from([
							23, 0x02, 0x11, 
                            // Node ID
                            0,
                            // State
                            4,  // Executing
                            // Current Position
                            0xc0, 0x00,
                            // Target
                            0xc7, 0x00,
                            // FP1 Current Position
                            0xf7, 0xfe,
                            // FP2 Current Position
                            0xf7, 0xfe,
                            // FP3 Current Position
                            0xf7, 0xfe,
                            // FP4 Current Position
                            0xf7, 0xfe,
                            // Remaining Time
                            0, 5,
                            // Time stamp
                            0x00, 0xf9, 0x39, 0x90
                        ]);
						const dataNtf = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "State").to.be.calledWithMatch({
							o: product,
							propertyName: "State",
							propertyValue: NodeOperatingState.Executing,
						});
						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWithMatch({
							o: product,
							propertyName: "CurrentPosition",
							propertyValue: 0.040000000000000036,
						});
						expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "TargetPositionRaw",
							propertyValue: 0xc700,
						});
						expect(propertyChangedSpy, "TargetPosition").to.be.calledWithMatch({
							o: product,
							propertyName: "TargetPosition",
							propertyValue: 0.0050000000000000044,
						});
						expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP1CurrentPositionRaw",
							propertyValue: 0xf7fe,
						});
						expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP2CurrentPositionRaw",
							propertyValue: 0xf7fe,
						});
						expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP3CurrentPositionRaw",
							propertyValue: 0xf7fe,
						});
						expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP4CurrentPositionRaw",
							propertyValue: 0xf7fe,
						});
						expect(propertyChangedSpy, "RemainingTime").to.be.calledWithMatch({
							o: product,
							propertyName: "RemainingTime",
							propertyValue: 5,
						});
						// expect(propertyChangedSpy, "TimeStamp").to.be.calledWithMatch({o: product, propertyName: "TimeStamp", propertyValue: new Date("1970-07-09 02:00:00 GMT+0100")});
					});

					it("shouldn't send any notifications", function () {
						// prettier-ignore
						const data = Buffer.from([
							23, 0x02, 0x11, 
                            // Node ID
                            0,
                            // State
                            5,  // Done
                            // Current Position
                            0xc8, 0x00,
                            // Target
                            0xc8, 0x00,
                            // FP1 Current Position
                            0xf7, 0xff,
                            // FP2 Current Position
                            0xf7, 0xff,
                            // FP3 Current Position
                            0xf7, 0xff,
                            // FP4 Current Position
                            0xf7, 0xff,
                            // Remaining Time
                            0, 0,
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3
                        ]);
						const dataNtf = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy).not.to.be.called;
					});
				});

				describe("GW_COMMAND_RUN_STATUS_NTF", function () {
					it("should send notifications for CurrentPositionRaw, CurrentPosition, RunStatus, StatusReply", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x00, 0xc0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWithMatch({
							o: product,
							propertyName: "CurrentPosition",
							propertyValue: 0.040000000000000036,
						});
						expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
						expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
					});

					it("should send notifications for FP1CurrentPositionRaw, RunStatus, StatusReply", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x01, 0xc0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP1CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
						expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
					});

					it("should send notifications for FP2CurrentPositionRaw, RunStatus, StatusReply", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x02, 0xc0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP2CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
						expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
					});

					it("should send notifications for FP3CurrentPositionRaw, RunStatus, StatusReply", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x03, 0xc0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP3CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
						expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
					});

					it("should send notifications for FP4CurrentPositionRaw, RunStatus, StatusReply", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x04, 0xc0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWithMatch({
							o: product,
							propertyName: "FP4CurrentPositionRaw",
							propertyValue: 0xc000,
						});
						expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({
							o: product,
							propertyName: "RunStatus",
							propertyValue: RunStatus.ExecutionActive,
						});
						expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({
							o: product,
							propertyName: "StatusReply",
							propertyValue: StatusReply.Ok,
						});
					});

					it("shouldn't send any notifications", function () {
						const data = Buffer.from([
							0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x00, 0xc8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00,
						]);
						const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy).not.to.be.called;
					});
				});

				describe("GW_COMMAND_REMAINING_TIME_NTF", function () {
					it("should send notifications for RemainingTime", function () {
						const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x00, 0x00, 0x00, 0x2a]);
						const dataNtf = new GW_COMMAND_REMAINING_TIME_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "RemainingTime").to.be.calledWithMatch({
							o: product,
							propertyName: "RemainingTime",
							propertyValue: 42,
						});
					});

					it("shouldn't send any notifications", function () {
						const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x00, 0x00, 0x00, 0x00]);
						const dataNtf = new GW_COMMAND_REMAINING_TIME_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy).not.to.be.called;
					});
				});

				describe("GW_GET_NODE_INFORMATION_NTF", function () {
					it("shouldn't send any notifications", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy).not.to.be.called;
					});

					it("should send notifications for Order only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x02, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Order").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "Order", propertyValue: 2 }),
						);
					});

					it("should send notifications for Placement only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x02, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Placement").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "Placement", propertyValue: 2 }),
						);
					});

					it("should send notifications for Name only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x47, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Name").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "Name", propertyValue: "Genster Badezimmer" }),
						);
					});

					it("should send notifications for Velocity only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x02, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "Velocity").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "Velocity", propertyValue: Velocity.Fast }),
						);
					});

					it("should send notifications for TypeID only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x00, 0x81, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "TypeID").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "TypeID",
								propertyValue: ActuatorType.RollerShutter,
							}),
						);
					});

					it("should send notifications for SubType only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x00, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "SubType").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "SubType", propertyValue: 0 }),
						);
					});

					it("should send notifications for ProductType only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x06, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "ProductType").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "ProductType", propertyValue: 6 }),
						);
					});

					it("should send notifications for NodeVariation only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x01, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "NodeVariation").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "NodeVariation",
								propertyValue: NodeVariation.TopHung,
							}),
						);
					});

					it("should send notifications for PowerSaveMode only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x00, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "PowerSaveMode").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "PowerSaveMode",
								propertyValue: PowerSaveMode.AlwaysAlive,
							}),
						);
					});

					it("should send notifications for SerialNumber only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "SerialNumber").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "SerialNumber",
								propertyValue: dataNtf.SerialNumber,
							}),
						);
					});

					it("should send notifications for State only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x03, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "State").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "State",
								propertyValue: NodeOperatingState.WaitingForPower,
							}),
						);
					});

					it("should send notifications for CurrentPosition/Raw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0x00, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWith(
							sinon.match({ o: product, propertyName: "CurrentPositionRaw", propertyValue: 0 }),
						);
						expect(propertyChangedSpy, "CurrentPosition").to.be.calledWith(
							sinon.match({ o: product, propertyName: "CurrentPosition", propertyValue: 1 }),
						);
						expect(propertyChangedSpy).to.be.calledTwice;
					});

					it("should send notifications for TargetPosition/Raw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0x00, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWith(
							sinon.match({ o: product, propertyName: "TargetPositionRaw", propertyValue: 0 }),
						);
						expect(propertyChangedSpy, "TargetPosition").to.be.calledWith(
							sinon.match({ o: product, propertyName: "TargetPosition", propertyValue: 1 }),
						);
						expect(propertyChangedSpy).to.be.calledTwice;
					});

					it("should send notifications for FP1CurrentPositionRaw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0x00, 0x00, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "FP1CurrentPositionRaw", propertyValue: 0 }),
						);
					});

					it("should send notifications for FP2CurrentPositionRaw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0x00, 0x00, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "FP2CurrentPositionRaw", propertyValue: 0 }),
						);
					});

					it("should send notifications for FP3CurrentPositionRaw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0x00, 0x00, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "FP3CurrentPositionRaw", propertyValue: 0 }),
						);
					});

					it("should send notifications for FP4CurrentPositionRaw only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0x00, 0x00, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "FP4CurrentPositionRaw", propertyValue: 0 }),
						);
					});

					it("should send notifications for RemainingTime only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x01, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "RemainingTime").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "RemainingTime", propertyValue: 1 }),
						);
					});

					it("should send notifications for TimeStamp only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf4, 
                            // Number of Alias
                            0x01, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "TimeStamp").to.be.calledOnceWith(
							sinon.match({ o: product, propertyName: "TimeStamp", propertyValue: dataNtf.TimeStamp }),
						);
					});

					it("should send notifications for ProductAlias only", function () {
						// prettier-ignore
						const data = Buffer.from([
                            0x7f, 0x02, 0x10, 
                            // Node ID
                            0x00, 
                            // Order
                            0x00, 0x00, 
                            // Placement
                            0x01, 
                            // Name
                            0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 
                            0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 
                            0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // Velocity
                            0x01, 
                            // Node type, sub type
                            0x01, 0x01, 
                            // Product group
                            0xd5, 
                            // Product type
                            0x07, 
                            // Node variation
                            0x00, 
                            // Power mode
                            0x01, 
                            // Build number
                            0x16, 
                            // Serial number
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            // State
                            0x05, 
                            // Current position
                            0xc8, 0x00, 
                            // Target position
                            0xc8, 0x00, 
                            // Current position (FP1)
                            0xf7, 0xff, 
                            // Current position (FP2)
                            0xf7, 0xff, 
                            // Current position (FP3)
                            0xf7, 0xff, 
                            // Current position (FP4)
                            0xf7, 0xff, 
                            // Remaining time
                            0x00, 0x00, 
                            // Time stamp
                            0x4f, 0x00, 0x3f, 0xf3, 
                            // Number of Alias
                            0x02, 
                            // Alias array
                            0xd8, 0x03, 0xb2, 0x1c, 
                            0xd8, 0x02, 0xb2, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00
                        ]);
						const dataNtf = new GW_GET_NODE_INFORMATION_NTF(data);

						conn.sendNotification(dataNtf, []);

						expect(propertyChangedSpy, "ProductAlias").to.be.calledOnceWith(
							sinon.match({
								o: product,
								propertyName: "ProductAlias",
								propertyValue: dataNtf.ActuatorAliases,
							}),
						);
					});
				});
			});
		});
	});
});
