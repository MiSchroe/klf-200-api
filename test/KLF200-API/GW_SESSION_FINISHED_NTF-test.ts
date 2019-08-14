"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_SESSION_FINISHED_NTF } from "../../src";

describe("KLF200-API", function() {
    describe("GW_SESSION_FINISHED_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([5, 0x03, 0x04, 0x47, 0x11]);
            it("should create without error", function() {
                expect(() => new GW_SESSION_FINISHED_NTF(data)).not.to.throw();
            });

            it("should return the session ID", function() {
                const result = new GW_SESSION_FINISHED_NTF(data);
                expect(result.SessionID).to.equal(0x4711);
            });
        });
    });
});