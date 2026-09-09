"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, afterEach, before } from "node:test";
import { fileURLToPath } from "node:url";
import {
	Connection,
	GW_COMMON_STATUS,
	GW_ERROR,
	GW_INVERSE_STATUS,
	Gateway,
	GatewayCommand,
	GatewayState,
	GatewaySubState,
	SoftwareVersion,
} from "../src";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands.js";
import { MockServerController } from "./mocks/mockServerController.js";

const testHOST = "localhost";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Gateway", { timeout: 20000 }, function () {
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

	describe("constructor", function () {
		it("should create without error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				assert.doesNotThrow(() => new Gateway(conn));
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when Connection is null", function () {
			assert.throws(() => new Gateway(null as any), { name: Error.name, message: "No connection provided" });
		});

		it("should throw an error when Connection is undefined", function () {
			assert.throws(() => new Gateway(undefined as any), Error);
		});
	});

	describe("changePasswordAsync", function () {
		it("should return true due to status.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				assert.strictEqual(await gw.changePasswordAsync("OldPassword", "NewPassword"), true);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return false due to status.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_PASSWORD_CHANGE_CFM,
					data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
				});
				assert.strictEqual(await gw.changePasswordAsync("OldPassword", "NewPassword"), false);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.changePasswordAsync("OldPassword", "NewPassword"), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when the new password exceeds 32 characters", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				const longPassword = "a".repeat(33); // 33 characters
				await assert.rejects(gw.changePasswordAsync("OldPassword", longPassword), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should accept a new password exactly 32 characters long", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				const validPassword = "a".repeat(32); // 32 characters
				await gw.changePasswordAsync("OldPassword", validPassword);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when the old password is empty", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_PASSWORD_CHANGE_CFM,
					data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
				});
				assert.strictEqual(await gw.changePasswordAsync("", "NewPassword"), false);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when the new password is empty", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_PASSWORD_CHANGE_CFM,
					data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
				});
				assert.strictEqual(await gw.changePasswordAsync("velux123", ""), false);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("getVersionAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_VERSION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.getVersionAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the version information.", async function () {
			const expectedResult = {
				SoftwareVersion: new SoftwareVersion(2, 3, 4, 71, 5, 6),
				HardwareVersion: 1,
				ProductGroup: 14,
				ProductType: 3,
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
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetGateway",
					gateway: expectedResult,
				});
				assert.deepStrictEqual(await gw.getVersionAsync(), expectedResult);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("getProtocolVersionAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_PROTOCOL_VERSION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.getProtocolVersionAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the version information.", async function () {
			const expectedResult = {
				MajorVersion: 0x1234,
				MinorVersion: 0x5678,
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
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetGateway",
					gateway: {
						ProtocolMajorVersion: 0x1234,
						ProtocolMinorVersion: 0x5678,
					},
				});
				assert.deepStrictEqual(await gw.getProtocolVersionAsync(), expectedResult);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("getStateAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_STATE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.getStateAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the version information.", async function () {
			const expectedResult = {
				GatewayState: GatewayState.GatewayMode_WithActuatorNodes,
				SubState: GatewaySubState.RunningCommand,
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
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetGateway",
					gateway: {
						GatewayState: GatewayState.GatewayMode_WithActuatorNodes,
						GatewaySubState: GatewaySubState.RunningCommand,
					},
				});
				assert.deepStrictEqual(await gw.getStateAsync(), expectedResult);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("setUTCDateTimeAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_UTC_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.setUTCDateTimeAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.setUTCDateTimeAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("setTimeZoneAsync", function () {
		const tz = ":GMT+1:GMT+2:0060:(1994)040102-0:110102-0";
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.setTimeZoneAsync(tz), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.setTimeZoneAsync(tz);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error due to status.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ,
					gatewayConfirmation: GatewayCommand.GW_RTC_SET_TIME_ZONE_CFM,
					data: Buffer.from([GW_INVERSE_STATUS.ERROR]).toString("base64"),
				});
				await assert.rejects(gw.setTimeZoneAsync(tz), Error);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("rebootAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_REBOOT_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.rebootAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.rebootAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("factoryResetAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.factoryResetAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.factoryResetAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("leaveLearnStateAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_LEAVE_LEARN_STATE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.leaveLearnStateAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.leaveLearnStateAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("getNetworkSettingsAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.getNetworkSettingsAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the network settings (non-DHCP).", async function () {
			const expectedResult = {
				IPAddress: "1.2.3.4",
				Mask: "5.6.7.8",
				DefaultGateway: "9.10.11.12",
				DHCP: false,
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
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetGateway",
					gateway: {
						IPAddress: "1.2.3.4",
						NetworkMask: "5.6.7.8",
						DefaultGateway: "9.10.11.12",
						DHCP: false,
					},
				});
				assert.deepStrictEqual(await gw.getNetworkSettingsAsync(), expectedResult);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the network settings (DHCP).", async function () {
			const expectedResult = {
				IPAddress: "0.0.0.0",
				Mask: "0.0.0.0",
				DefaultGateway: "0.0.0.0",
				DHCP: true,
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
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetGateway",
					gateway: {
						IPAddress: "0.0.0.0",
						NetworkMask: "0.0.0.0",
						DefaultGateway: "0.0.0.0",
						DHCP: true,
					},
				});
				assert.deepStrictEqual(await gw.getNetworkSettingsAsync(), expectedResult);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("setNetworkSettingsAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.setNetworkSettingsAsync(true), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error (DHCP).", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NETWORK_SETUP_CFM,
					data: Buffer.from([]).toString("base64"),
				});
				await gw.setNetworkSettingsAsync(true);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error (non-DHCP).", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NETWORK_SETUP_CFM,
					data: Buffer.from([]).toString("base64"),
				});
				await gw.setNetworkSettingsAsync(false, "1.2.3.4", "5.6.7.8", "9.10.11.12");
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when invalid IP addresses are provided", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await assert.rejects(
					gw.setNetworkSettingsAsync(false, "invalidIP", "255.255.255.0", "192.168.1.1"),
					Error,
				);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should throw an error when DHCP is true but additional parameters are provided", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.InvalidFrameStructure]).toString("base64"),
				});
				await assert.rejects(
					gw.setNetworkSettingsAsync(true as any, "192.168.1.2", "255.255.255.0", "192.168.1.1"),
					Error,
				);
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("enableHouseStatusMonitorAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.enableHouseStatusMonitorAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.enableHouseStatusMonitorAsync();
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should handle multiple calls to enableHouseStatusMonitorAsync gracefully", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.enableHouseStatusMonitorAsync();
				await gw.enableHouseStatusMonitorAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});

	describe("disableHouseStatusMonitorAsync", function () {
		it("should throw an error due to an error frame received.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await mockServerController.sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await assert.rejects(gw.disableHouseStatusMonitorAsync(), Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("shouldn't throw an error.", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.disableHouseStatusMonitorAsync();
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should handle multiple calls to disableHouseStatusMonitorAsync gracefully", async function () {
			const conn = new Connection(testHOST, {
				rejectUnauthorized: true,
				requestCert: true,
				ca: readFileSync(join(__dirname, "mocks/mockServer", "ca-crt.pem")),
				key: readFileSync(join(__dirname, "mocks/mockServer", "client1-key.pem")),
				cert: readFileSync(join(__dirname, "mocks/mockServer", "client1-crt.pem")),
			});
			try {
				await conn.loginAsync("velux123");
				const gw = new Gateway(conn);
				await gw.disableHouseStatusMonitorAsync();
				await gw.disableHouseStatusMonitorAsync();
			} finally {
				await conn.logoutAsync();
			}
		});
	});
});
