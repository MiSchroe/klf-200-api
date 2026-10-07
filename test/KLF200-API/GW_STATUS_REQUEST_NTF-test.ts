"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommandOriginator, GW_STATUS_REQUEST_NTF, RunStatus, StatusOwner, StatusReply, StatusType } from "../../src";

describe("KLF200-API", function () {
	describe("GW_STATUS_REQUEST_NTF", function () {
		[StatusType.RequestTargetPosition, StatusType.RequestCurrentPosition, StatusType.RequestRemainingTime].forEach(
			(statusType) => {
				describe(`StatusType = ${StatusType[statusType]}`, function () {
					const data = Buffer.from([
						17,
						0x03,
						0x07,
						// Session ID
						0x47,
						0x11,
						// Status Owner
						0x02,
						// Node ID
						0x07,
						// Run status
						0x02,
						// Status Reply
						0x01,
						// Status Type
						statusType,
						// Status Count
						2,
						// Parameter Data
						0,
						0xc4,
						0x00,
						1,
						0xc3,
						0xff,
					]);
					describe("Constructor", function () {
						it("should create without error", function () {
							assert.doesNotThrow(() => new GW_STATUS_REQUEST_NTF(data));
						});

						it("should return the session ID", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.SessionID, 0x4711);
						});

						it("should return the status owner", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.StatusOwner, StatusOwner.Rain);
						});

						it("should return the node ID", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.NodeID, 7);
						});

						it("should return the run status", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.RunStatus, RunStatus.ExecutionActive);
						});

						it("should return the status reply Ok", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.StatusReply, StatusReply.Ok);
						});

						it("should return the status type", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.strictEqual(result.StatusType, statusType);
						});

						it("should return the parameter data", function () {
							const result = new GW_STATUS_REQUEST_NTF(data);
							assert.ok(result.ParameterData instanceof Array);
							assert.deepStrictEqual(result.ParameterData, [
								{
									ID: 0,
									Value: 0xc400,
								},
								{
									ID: 1,
									Value: 0xc3ff,
								},
							]);
						});
					});
				});
			},
		);

		const statusType = StatusType.RequestMainInfo;
		describe(`StatusType = ${StatusType[statusType]}`, function () {
			const data = Buffer.from([
				21,
				0x03,
				0x07,
				// Session ID
				0x47,
				0x11,
				// Status Owner
				0x02,
				// Node ID
				0x07,
				// Run status
				0x02,
				// Status Reply
				0x01,
				// Status Type
				statusType,
				// Target Position
				0xc4,
				0x00,
				// Current Position
				0xc3,
				0xff,
				// Remaining time
				0x12,
				0x34,
				// Last master execution address
				0x00,
				0x65,
				0x43,
				0x21,
				// Last command originator
				2, // Rain
			]);
			describe("Constructor", function () {
				it("should create without error", function () {
					assert.doesNotThrow(() => new GW_STATUS_REQUEST_NTF(data));
				});

				it("should return the session ID", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.SessionID, 0x4711);
				});

				it("should return the status owner", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.StatusOwner, StatusOwner.Rain);
				});

				it("should return the node ID", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.NodeID, 7);
				});

				it("should return the run status", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.RunStatus, RunStatus.ExecutionActive);
				});

				it("should return the status reply Ok", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.StatusReply, StatusReply.Ok);
				});

				it("should return the status type", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.StatusType, statusType);
				});

				it("should return the target position", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.TargetPosition, 0xc400);
				});

				it("should return the current position", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.CurrentPosition, 0xc3ff);
				});

				it("should return the remaining time", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.RemainingTime, 0x1234);
				});

				it("should return the last master execution address", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.LastMasterExecutionAddress, 0x654321);
				});

				it("should return the last command originator", function () {
					const result = new GW_STATUS_REQUEST_NTF(data);
					assert.strictEqual(result.LastCommandOriginator, CommandOriginator.Rain);
				});
			});
		});
	});
});
