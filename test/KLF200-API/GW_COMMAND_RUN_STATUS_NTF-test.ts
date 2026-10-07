"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_COMMAND_RUN_STATUS_NTF, ParameterActive, StatusOwner, RunStatus, StatusReply } from "../../src";

describe("KLF200-API", function () {
	describe("GW_COMMAND_RUN_STATUS_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				assert.doesNotThrow(() => new GW_COMMAND_RUN_STATUS_NTF(data));
			});

			it("should return the session ID", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.SessionID, 0x4711);
			});

			it("should return the status owner", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.StatusOwner, StatusOwner.Rain);
			});

			it("should return the node ID", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.NodeID, 7);
			});

			it("should return the node parameter FP2", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.NodeParameter, ParameterActive.FP2);
			});

			it("should return the parameter value", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.ParameterValue, 0xfb00);
			});

			it("should return the run status", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.RunStatus, RunStatus.ExecutionActive);
			});

			it("should return the status reply Ok", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.StatusReply, StatusReply.Ok);
			});

			it("should return the information code", function () {
				const data = Buffer.from([
					0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xfb, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
				]);
				const result = new GW_COMMAND_RUN_STATUS_NTF(data);
				assert.strictEqual(result.InformationCode, 0);
			});
		});
	});
});
