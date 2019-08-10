'use strict';

import { expect, use } from "chai";
import 'mocha';
import { GW_GET_ACTIVATION_LOG_LINE_CFM, StatusOwner, ParameterActive, RunStatus, StatusReply } from "../../src";
import datetime from "chai-datetime";
use(datetime);


describe("KLF200-API", function() {
    describe("GW_GET_ACTIVATION_LOG_LINE_CFM", function() {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([20, 0x05, 0x05, 
                // Timestamp for 2018-12-31
                0x5c, 0x29, 0x5c, 0x00,
                // Session ID
                0, 42,
                // Status
                0x02,   // rain sensor
                // Index
                17,
                // Node parameter
                0,
                // Parameter value
                0x00, 0x00,
                // Run status
                0x01,   // failed
                // Status reply
                0x03,   // manually operated
                // Information code
                0x12, 0x34, 0x56, 0x78
                ]);
                expect(() => new GW_GET_ACTIVATION_LOG_LINE_CFM(data)).not.to.throw();
            });

            it("should return the correct property values", function() {
                const data = Buffer.from([20, 0x05, 0x05, 
                    // Timestamp for 2018-12-31
                    0x5c, 0x29, 0x5c, 0x00,
                    // Session ID
                    0, 42,
                    // Status
                    0x02,   // rain sensor
                    // Index
                    17,
                    // Node parameter
                    0,
                    // Parameter value
                    0x12, 0x34,
                    // Run status
                    0x01,   // failed
                    // Status reply
                    0x03,   // manually operated
                    // Information code
                    0x12, 0x34, 0x56, 0x78
                    ]);
                    const result = new GW_GET_ACTIVATION_LOG_LINE_CFM(data);
                expect(result.TimeStamp).to.equalDate(new Date(1546214400000));
                expect(result.SessionID).to.equal(42);
                expect(result.StatusOwner).to.equal(StatusOwner.Rain);
                expect(result.NodeID).to.equal(17);
                expect(result.NodeParameter).to.equal(ParameterActive.MP);
                expect(result.ParameterValue).to.equal(0x1234);
                expect(result.RunStatus).to.equal(RunStatus.ExecutionFailed);
                expect(result.StatusReply).to.equal(StatusReply.ManuallyOperated);
                expect(result.InformationCode).to.equal(0x12345678);
            });
        });
    });
});