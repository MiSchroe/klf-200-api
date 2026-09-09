"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GW_CS_PGC_JOB_NTF, PGCJobState, PGCJobStatus, PGCJobType } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_PGC_JOB_NTF", function () {
		describe("Constructor", function () {
			const data = Buffer.from([0x06, 0x01, 0x11, 0x01, 0x02, 0x03]);
			it("should create without error", function () {
				assert.doesNotThrow(() => new GW_CS_PGC_JOB_NTF(data));
			});

			it("should return the correct PGC Job State", function () {
				const result = new GW_CS_PGC_JOB_NTF(data);
				assert.strictEqual(result.PGCJobState, PGCJobState.PGCJobEnded);
			});

			it("should return the correct PGC Job Status", function () {
				const result = new GW_CS_PGC_JOB_NTF(data);
				assert.strictEqual(result.PGCJobStatus, PGCJobStatus.Failed_JobError);
			});

			it("should return the correct PGC Job Type", function () {
				const result = new GW_CS_PGC_JOB_NTF(data);
				assert.strictEqual(result.PGCJobType, PGCJobType.GenerateKey);
			});
		});
	});
});
