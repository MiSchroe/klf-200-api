'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_CS_PGC_JOB_NTF, PGCJobState, PGCJobStatus, PGCJobType } from "../../src";

describe("KLF200-API", function() {
    describe("GW_CS_PGC_JOB_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([0x06, 0x01, 0x11, 0x01, 0x02, 0x03]);
            it("should create without error", function() {
                expect(() => new GW_CS_PGC_JOB_NTF(data)).not.to.throw();
            });

            it("should return the correct PGC Job State", function() {
                const result = new GW_CS_PGC_JOB_NTF(data);
                expect(result.PGCJobState).equals(PGCJobState.PGCJobEnded);
            });

            it("should return the correct PGC Job Status", function() {
                const result = new GW_CS_PGC_JOB_NTF(data);
                expect(result.PGCJobStatus).equals(PGCJobStatus.Failed_JobError);
            });

            it("should return the correct PGC Job Type", function() {
                const result = new GW_CS_PGC_JOB_NTF(data);
                expect(result.PGCJobType).equals(PGCJobType.GenerateKey);
            });
        });
    });
});