'use strict';

import { SLIPProtocol } from "../../src/KLF200-API/common";
import { expect } from "chai";
import 'mocha';

// import * as chaibytes from "chai-bytes";
// chai.use(chaibytes);

describe("KLF200-API", function() {
    describe("SLIPProtocol", function () {
        it("should return the encoded buffer.", function() {
            const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
            const expectedBuffer = Buffer.from([192, 0, 4, 0, 0, 1, 5, 192]);
    
            const result = SLIPProtocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the decoded buffer.", function() {
            const inputBuffer = Buffer.from([192, 0, 4, 0, 0, 1, 5, 192]);
            const expectedBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
    
            const result = SLIPProtocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result.toString("hex")} expected to be equal to ${expectedBuffer.toString("hex")}`).to.be.true;
        });

        it("should return the encoded buffer for an empty buffer.", function() {
            const inputBuffer = Buffer.alloc(0);
            const expectedBuffer = Buffer.from([192, 192]);
    
            const result = SLIPProtocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return an empty buffer after decode.", function() {
            const inputBuffer = Buffer.from([192, 192]);
            const expectedBuffer = Buffer.alloc(0);
    
            const result = SLIPProtocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the encoded END marker.", function() {
            const inputBuffer = Buffer.from([192]);
            const expectedBuffer = Buffer.from([192, 219, 220, 192]);
    
            const result = SLIPProtocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the encoded ESC marker.", function() {
            const inputBuffer = Buffer.from([219]);
            const expectedBuffer = Buffer.from([192, 219, 221, 192]);
    
            const result = SLIPProtocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the decoded END marker.", function() {
            const inputBuffer = Buffer.from([192, 219, 220, 192]);
            const expectedBuffer = Buffer.from([192]);
    
            const result = SLIPProtocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the decoded ESC marker.", function() {
            const inputBuffer = Buffer.from([192, 219, 221, 192]);
            const expectedBuffer = Buffer.from([219]);
    
            const result = SLIPProtocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should throw an exception on missing markers.", function() {
            const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5]);
    
            expect(() => SLIPProtocol.Decode(inputBuffer)).to.throw();
        });

        it("should throw an exception on missing start marker.", function() {
            const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5, 192]);
    
            expect(() => SLIPProtocol.Decode(inputBuffer)).to.throw();
        });

        it("should throw an exception on missing end marker.", function() {
            const inputBuffer = Buffer.from([192, 42, 4, 0, 0, 1, 5]);
    
            expect(() => SLIPProtocol.Decode(inputBuffer)).to.throw();
        });

        it("should throw an exception on wrong ESC sequence.", function() {
            const inputBuffer = Buffer.from([192, 219, 42, 192]);
    
            expect(() => SLIPProtocol.Decode(inputBuffer)).to.throw();
        });

    });
});