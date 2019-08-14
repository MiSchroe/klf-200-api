"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_COMMAND_RUN_STATUS_NTF, ParameterActive, StatusOwner, RunStatus, StatusReply } from "../../src";

describe("KLF200-API", function() {
    describe("GW_COMMAND_RUN_STATUS_NTF", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(() => new GW_COMMAND_RUN_STATUS_NTF(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.SessionID).to.equal(0x4711);
            });

            it("should return the status owner", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.StatusOwner).to.equal(StatusOwner.Rain);
            });

            it("should return the node ID", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.NodeID).to.equal(7);
            });

            it("should return the node parameter FP2", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.NodeParameter).to.equal(ParameterActive.FP2);
            });

            it("should return the parameter value", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.ParameterValue).to.equal(0xFB00);
            });

            it("should return the run status", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.RunStatus).to.equal(RunStatus.ExecutionActive);
            });

            it("should return the status reply Ok", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.StatusReply).to.equal(StatusReply.Ok);
            });

            it("should return the information code", function() {
                const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x07, 0x02, 0xFB, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
                const result = new GW_COMMAND_RUN_STATUS_NTF(data);
                expect(result.InformationCode).to.equal(0);
            });
        });
    });
});