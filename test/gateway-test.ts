"use strict";

import {
	Gateway,
	GW_PASSWORD_CHANGE_CFM,
	GW_ERROR_NTF,
	GW_GET_VERSION_CFM,
	GW_GET_PROTOCOL_VERSION_CFM,
	GatewayState,
	GatewaySubState,
	GW_GET_STATE_CFM,
	GW_SET_UTC_CFM,
	GW_RTC_SET_TIME_ZONE_CFM,
	GW_REBOOT_CFM,
	GW_SET_FACTORY_DEFAULT_CFM,
	GW_LEAVE_LEARN_STATE_CFM,
	GW_GET_NETWORK_SETUP_CFM,
	GW_SET_NETWORK_SETUP_CFM,
	GW_HOUSE_STATUS_MONITOR_ENABLE_CFM,
	GW_HOUSE_STATUS_MONITOR_DISABLE_CFM,
} from "../src";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MockExceptionConnection, MockConnection } from "./mocks/mockConnection";

use(chaiAsPromised);

describe("Gateway", function () {
	describe("constructor", function () {
		it("should create without error.", function () {
			const conn = new MockExceptionConnection();
			expect(() => new Gateway(conn)).not.to.throw();
		});
	});

	describe("changePasswordAsync", function () {
		it("should return true due to status.", function (done) {
			const data = Buffer.from([0x04, 0x30, 0x03, 0x00]);
			const conn = new MockConnection(new GW_PASSWORD_CHANGE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.eventually.true.and.notify(done);
		});

		it("should return false due to status.", function (done) {
			const data = Buffer.from([0x04, 0x30, 0x03, 0x01]);
			const conn = new MockConnection(new GW_PASSWORD_CHANGE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.eventually.false.and.notify(done);
		});

		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.changePasswordAsync("OldPassword", "NewPassword")).to.be.rejectedWith(Error).and.notify(done);
		});
	});

	describe("getVersionAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.getVersionAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should return the version information.", function (done) {
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
			const data = Buffer.from([0x0a, 0x00, 0x09, 2, 3, 4, 71, 5, 6, 1, 14, 3]);
			const conn = new MockConnection(new GW_GET_VERSION_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.getVersionAsync()).to.be.eventually.deep.equal(expectedResult).and.notify(done);
		});
	});

	describe("getProtocolVersionAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.getProtocolVersionAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should return the version information.", function (done) {
			const expectedResult = {
				MajorVersion: 0x1234,
				MinorVersion: 0x5678,
			};
			const data = Buffer.from([0x07, 0x00, 0x0b, 0x12, 0x34, 0x56, 0x78]);
			const conn = new MockConnection(new GW_GET_PROTOCOL_VERSION_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.getProtocolVersionAsync()).to.be.eventually.deep.equal(expectedResult).and.notify(done);
		});
	});

	describe("getStateAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.getStateAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should return the version information.", function (done) {
			const expectedResult = {
				GatewayState: GatewayState.GatewayMode_WithActuatorNodes,
				SubState: GatewaySubState.RunningCommand,
			};
			const data = Buffer.from([9, 0x00, 0x0d, 2, 0x80, 0, 0, 0, 0]);
			const conn = new MockConnection(new GW_GET_STATE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.getStateAsync()).to.be.eventually.deep.equal(expectedResult).and.notify(done);
		});
	});

	describe("setUTCDateTimeAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.setUTCDateTimeAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x03, 0x20, 0x01]);
			const conn = new MockConnection(new GW_SET_UTC_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.setUTCDateTimeAsync()).to.be.fulfilled.and.notify(done);
		});
	});

	describe("setTimeZoneAsync", function () {
		const tz = ":GMT+1:GMT+2:0060:(1994)040102-0:110102-0";
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.setTimeZoneAsync(tz)).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x04, 0x20, 0x03, 0x01]);
			const conn = new MockConnection(new GW_RTC_SET_TIME_ZONE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.setTimeZoneAsync(tz)).to.be.fulfilled.and.notify(done);
		});

		it("should throw an error due to status.", function (done) {
			const data = Buffer.from([0x04, 0x20, 0x03, 0x00]);
			const conn = new MockConnection(new GW_RTC_SET_TIME_ZONE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.setTimeZoneAsync(tz)).to.be.rejectedWith(Error).and.notify(done);
		});
	});

	describe("rebootAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.rebootAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x03, 0x00, 0x02]);
			const conn = new MockConnection(new GW_REBOOT_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.rebootAsync()).to.be.fulfilled.and.notify(done);
		});
	});

	describe("factoryResetAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.factoryResetAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x03, 0x00, 0x04]);
			const conn = new MockConnection(new GW_SET_FACTORY_DEFAULT_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.factoryResetAsync()).to.be.fulfilled.and.notify(done);
		});
	});

	describe("leaveLearnStateAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.leaveLearnStateAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x0f, 0x01]);
			const conn = new MockConnection(new GW_LEAVE_LEARN_STATE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.leaveLearnStateAsync()).to.be.fulfilled.and.notify(done);
		});
	});

	describe("getNetworkSettingsAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.getNetworkSettingsAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("should return the network settings (non-DHCP).", function (done) {
			const expectedResult = {
				IPAddress: "1.2.3.4",
				Mask: "5.6.7.8",
				DefaultGateway: "9.10.11.12",
				DHCP: false,
			};
			const data = Buffer.from([
				16, 0x00, 0xe1,
				// IP address
				1, 2, 3, 4,
				// Mask
				5, 6, 7, 8,
				// Gateway
				9, 10, 11, 12,
				// DHCP
				0,
			]);
			const conn = new MockConnection(new GW_GET_NETWORK_SETUP_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.getNetworkSettingsAsync()).to.be.eventually.deep.equal(expectedResult).and.notify(done);
		});

		it("should return the network settings (DHCP).", function (done) {
			const expectedResult = {
				IPAddress: "0.0.0.0",
				Mask: "0.0.0.0",
				DefaultGateway: "0.0.0.0",
				DHCP: true,
			};
			const data = Buffer.from([
				16, 0x00, 0xe1,
				// IP address
				0, 0, 0, 0,
				// Mask
				0, 0, 0, 0,
				// Gateway
				0, 0, 0, 0,
				// DHCP
				1,
			]);
			const conn = new MockConnection(new GW_GET_NETWORK_SETUP_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.getNetworkSettingsAsync()).to.be.eventually.deep.equal(expectedResult).and.notify(done);
		});
	});

	describe("setNetworkSettingsAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.setNetworkSettingsAsync(true)).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error (DHCP).", function (done) {
			const data = Buffer.from([0x03, 0x00, 0xe3]);
			const conn = new MockConnection(new GW_SET_NETWORK_SETUP_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.setNetworkSettingsAsync(true)).to.be.fulfilled.and.notify(done);
		});

		it("shouldn't throw an error (non-DHCP).", function (done) {
			const data = Buffer.from([0x03, 0x00, 0xe3]);
			const conn = new MockConnection(new GW_SET_NETWORK_SETUP_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.setNetworkSettingsAsync(false, "1.2.3.4", "5.6.7.8", "9.10.11.12")).to.be.fulfilled.and.notify(
				done,
			);
		});
	});

	describe("enableHouseStatusMonitorAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.enableHouseStatusMonitorAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x03, 0x02, 0x41]);
			const conn = new MockConnection(new GW_HOUSE_STATUS_MONITOR_ENABLE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.enableHouseStatusMonitorAsync()).to.be.fulfilled.and.notify(done);
		});
	});

	describe("disableHouseStatusMonitorAsync", function () {
		it("should throw an error due to an error frame received.", function (done) {
			const data = Buffer.from([0x04, 0x00, 0x00, 0x07]);
			const conn = new MockConnection(new GW_ERROR_NTF(data));
			const gw = new Gateway(conn);
			expect(gw.disableHouseStatusMonitorAsync()).to.be.rejectedWith(Error).and.notify(done);
		});

		it("shouldn't throw an error.", function (done) {
			const data = Buffer.from([0x03, 0x02, 0x43]);
			const conn = new MockConnection(new GW_HOUSE_STATUS_MONITOR_DISABLE_CFM(data));
			const gw = new Gateway(conn);
			expect(gw.disableHouseStatusMonitorAsync()).to.be.fulfilled.and.notify(done);
		});
	});
});
