"use strict";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFileSync } from "fs";
import { join } from "path";
import {
	Connection,
	GW_COMMON_STATUS,
	GW_ERROR,
	GW_INVERSE_STATUS,
	Gateway,
	GatewayCommand,
	GatewayState,
	GatewaySubState,
} from "../src";
import { CloseConnectionCommand, ResetCommand } from "./mocks/mockServer/commands";
import { MockServerController } from "./mocks/mockServerController";

use(chaiAsPromised);

const testHOST = "localhost";
const __dirname = import.meta.dirname;

describe("Gateway", function () {
	this.timeout(10000);

	this.beforeAll(async function () {
		this.mockServerController = await MockServerController.createMockServer();
	});

	this.afterAll(async function () {
		await this.mockServerController[Symbol.asyncDispose]();
	});

	this.afterEach(async function () {
		await this.mockServerController.sendCommand(ResetCommand);
		await this.mockServerController.sendCommand(CloseConnectionCommand);
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
				expect(() => new Gateway(conn)).not.to.throw();
			} finally {
				await conn.logoutAsync();
			}
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
				await expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.eventually.true;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_PASSWORD_CHANGE_CFM,
					data: Buffer.from([GW_COMMON_STATUS.ERROR]).toString("base64"),
				});
				await expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.eventually.false;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_PASSWORD_CHANGE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_VERSION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.getVersionAsync()).to.be.rejectedWith(Error);
			} finally {
				await conn.logoutAsync();
			}
		});

		it("should return the version information.", async function () {
			const expectedResult = {
				SoftwareVersion: {
					CommandVersion: 2,
					MainVersion: 3,
					SubVersion: 4,
					BranchID: 71,
					Build: 5,
					MicroBuild: 6,
				},
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetGateway",
					gateway: expectedResult,
				});
				await expect(gw.getVersionAsync()).to.be.eventually.deep.equal(expectedResult);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_PROTOCOL_VERSION_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.getProtocolVersionAsync()).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetGateway",
					gateway: {
						ProtocolMajorVersion: 0x1234,
						ProtocolMinorVersion: 0x5678,
					},
				});
				await expect(gw.getProtocolVersionAsync()).to.be.eventually.deep.equal(expectedResult);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_STATE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.getStateAsync()).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetGateway",
					gateway: {
						GatewayState: GatewayState.GatewayMode_WithActuatorNodes,
						GatewaySubState: GatewaySubState.RunningCommand,
					},
				});
				await expect(gw.getStateAsync()).to.be.eventually.deep.equal(expectedResult);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_UTC_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.setUTCDateTimeAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.setUTCDateTimeAsync()).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.setTimeZoneAsync(tz)).to.be.rejectedWith(Error);
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
				await expect(gw.setTimeZoneAsync(tz)).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ,
					gatewayConfirmation: GatewayCommand.GW_RTC_SET_TIME_ZONE_CFM,
					data: Buffer.from([GW_INVERSE_STATUS.ERROR]).toString("base64"),
				});
				await expect(gw.setTimeZoneAsync(tz)).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_REBOOT_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.rebootAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.rebootAsync()).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.factoryResetAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.factoryResetAsync()).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_LEAVE_LEARN_STATE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.leaveLearnStateAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.leaveLearnStateAsync()).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_GET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.getNetworkSettingsAsync()).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetGateway",
					gateway: {
						IPAddress: "1.2.3.4",
						NetworkMask: "5.6.7.8",
						DefaultGateway: "9.10.11.12",
						DHCP: false,
					},
				});
				await expect(gw.getNetworkSettingsAsync()).to.be.eventually.deep.equal(expectedResult);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetGateway",
					gateway: {
						IPAddress: "0.0.0.0",
						NetworkMask: "0.0.0.0",
						DefaultGateway: "0.0.0.0",
						DHCP: true,
					},
				});
				await expect(gw.getNetworkSettingsAsync()).to.be.eventually.deep.equal(expectedResult);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.setNetworkSettingsAsync(true)).to.be.rejectedWith(Error);
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NETWORK_SETUP_CFM,
					data: Buffer.from([]).toString("base64"),
				});
				await expect(gw.setNetworkSettingsAsync(true)).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_SET_NETWORK_SETUP_REQ,
					gatewayConfirmation: GatewayCommand.GW_SET_NETWORK_SETUP_CFM,
					data: Buffer.from([]).toString("base64"),
				});
				await expect(gw.setNetworkSettingsAsync(false, "1.2.3.4", "5.6.7.8", "9.10.11.12")).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.enableHouseStatusMonitorAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.enableHouseStatusMonitorAsync()).to.be.fulfilled;
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
				await (this.mockServerController as MockServerController).sendCommand({
					command: "SetConfirmation",
					gatewayCommand: GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ,
					gatewayConfirmation: GatewayCommand.GW_ERROR_NTF,
					data: Buffer.from([GW_ERROR.Busy]).toString("base64"),
				});
				await expect(gw.disableHouseStatusMonitorAsync()).to.be.rejectedWith(Error);
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
				await expect(gw.disableHouseStatusMonitorAsync()).to.be.fulfilled;
			} finally {
				await conn.logoutAsync();
			}
		});
	});
});
