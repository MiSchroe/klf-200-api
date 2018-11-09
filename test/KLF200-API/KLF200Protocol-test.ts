'use strict';

import { KLF200Protocol } from "../../src/KLF200-API/common";
import { expect } from "chai";
import 'mocha';

// import * as chaibytes from "chai-bytes";
// chai.use(chaibytes);

describe("KLF200-API", function() {
    describe("KLF200Protocol", function () {
        it("should return the encoded buffer.", function() {
            const inputBuffer = Buffer.from([4, 0, 0, 1]);
            const expectedBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
    
            const result = KLF200Protocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return the decoded buffer.", function() {
            const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 5]);
            const expectedBuffer = Buffer.from([4, 0, 0, 1]);
    
            const result = KLF200Protocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result.toString("hex")} expected to be equal to ${expectedBuffer.toString("hex")}`).to.be.true;
        });

        it("should return the encoded buffer for an empty buffer.", function() {
            const inputBuffer = Buffer.alloc(0);
            const expectedBuffer = Buffer.from([0, 0]);
    
            const result = KLF200Protocol.Encode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should return an empty buffer after decode.", function() {
            const inputBuffer = Buffer.from([0, 0]);
            const expectedBuffer = Buffer.alloc(0);
    
            const result = KLF200Protocol.Decode(inputBuffer);
            //expect(result).equalBytes(expectedBuffer);
            expect(result.equals(expectedBuffer), `${result} expected to be equal to ${expectedBuffer}`).to.be.true;
        });

        it("should throw an exception on wrong ProtocolID.", function() {
            const inputBuffer = Buffer.from([42, 4, 0, 0, 1, 5]);
            const expectedBuffer = Buffer.from([4, 0, 0, 1]);
    
            expect(() => KLF200Protocol.Decode(inputBuffer)).to.throw();
        });

        it("should throw an exception on wrong CRC.", function() {
            const inputBuffer = Buffer.from([0, 4, 0, 0, 1, 42]);
            const expectedBuffer = Buffer.from([4, 0, 0, 1]);
    
            expect(() => KLF200Protocol.Decode(inputBuffer)).to.throw();
        });

    });
});