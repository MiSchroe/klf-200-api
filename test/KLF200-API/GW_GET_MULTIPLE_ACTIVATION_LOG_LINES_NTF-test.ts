"use strict";

import { expect } from "chai";
import "mocha";
import {
	GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF,
	ParameterActive,
	RunStatus,
	StatusOwner,
	StatusReply,
} from "../../src";

describe("KLF200-API", function () {
	describe("GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF", function () {
		describe("Constructor", function () {
			const testDate = new Date(2019, 6, 9, 12, 34, 56);
			// prettier-ignore
			const data = Buffer.from([
				20, 0x05, 0x08, 
                // Timestamp
                ((testDate.valueOf() / 1000) >>> 24) & 0xff,
                ((testDate.valueOf() / 1000) >>> 16) & 0xff,
                ((testDate.valueOf() / 1000) >>>  8) & 0xff,
                ((testDate.valueOf() / 1000) >>>  0) & 0xff,
                // Session ID
                0x47, 0x11,
                // Status ID
                0x02,   // Rain
                // Node ID
                42,
                // Node parameter
                0x01,   // FP1
                // Parameter value
                0xc4, 0xef,
                // Run status
                0x02,   // Execution active
                // Status reply
                0x01,   // Ok
                // Information code
                0x87, 0x65, 0x43, 0x21
            ]);

			it("should create without error", function () {
				expect(() => new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data)).not.to.throw();
			});

			it("should return the timestamp", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.TimeStamp).to.deep.equal(testDate);
			});

			it("should return the session ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.SessionID).to.equal(0x4711);
			});

			it("should return the status ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.StatusOwner).to.equal(StatusOwner.Rain);
			});

			it("should return the node ID", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.NodeID).to.equal(42);
			});

			it("should return the node parameter FP1", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.NodeParameter).to.equal(ParameterActive.FP1);
			});

			it("should return the parameter value", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.ParameterValue).to.equal(0xc4ef);
			});

			it("should return the run status", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.RunStatus).to.equal(RunStatus.ExecutionActive);
			});

			it("should return the status reply", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.StatusReply).to.equal(StatusReply.Ok);
			});

			it("should return the information code", function () {
				const result = new GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF(data);
				expect(result.InformationCode).to.equal(0x87654321);
			});
		});
	});
});
