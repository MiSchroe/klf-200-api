'use strict';

import { GatewayCommand } from "../../src/KLF200-API/common";
import { GW_ERROR_NTF, GW_ERROR } from "../../src/KLF200-API/GW_ERROR_NTF";
import { expect } from "chai";
import 'mocha';

describe("KLF200-API", function() {
    describe("GW_ERROR_NTF", function () {
        it('This test should be reached', function() {
            expect(1).to.be.equal(1);
        });

        it("should return a valid error number.", function() {
            const error = 7; // Busy
            const buff = Buffer.alloc(4);
            buff.writeUInt8(4, 0);
            buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
            buff.writeUInt8(error, 3);
    
            const result = new GW_ERROR_NTF(buff);
            expect(result).to.be.instanceOf(GW_ERROR_NTF);
            expect(result.ErrorNumber).equals(error);
        });

        it("should return a valid zero error number.", function() {
            const error = 0; // NotFurtherDefined
            const buff = Buffer.alloc(4);
            buff.writeUInt8(4, 0);
            buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
            buff.writeUInt8(error, 3);
    
            const result = new GW_ERROR_NTF(buff);
            expect(result).to.be.instanceOf(GW_ERROR_NTF);
            expect(result.ErrorNumber).equals(error);
        });

        it("should return the unknown error number.", function() {
            const error = 255; // UnknonwErrorCode
            const buff = Buffer.alloc(4);
            buff.writeUInt8(4, 0);
            buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
            buff.writeUInt8(error, 3);
    
            const result = new GW_ERROR_NTF(buff);
            expect(result).to.be.instanceOf(GW_ERROR_NTF);
            expect(result.ErrorNumber).equals(error);
        });

        it("should return the unknown error number, if the provided error number is not known.", function() {
            const error = 128; // UnknonwErrorCode
            const buff = Buffer.alloc(4);
            buff.writeUInt8(4, 0);
            buff.writeUInt16BE(GatewayCommand.GW_ERROR_NTF, 1);
            buff.writeUInt8(error, 3);
    
            const result = new GW_ERROR_NTF(buff);
            expect(result).to.be.instanceOf(GW_ERROR_NTF);
            expect(result.ErrorNumber).equals(GW_ERROR.UnknonwErrorCode);
        });

        it("should throw an exception if the command isn't matching", function() {
            const error = 128; // UnknonwErrorCode
            const buff = Buffer.alloc(4);
            buff.writeUInt8(4, 0);
            buff.writeUInt16BE(GatewayCommand.GW_ACTIVATE_SCENE_CFM, 1);    // Just take some other command
            buff.writeUInt8(error, 3);
    
            expect(() => new GW_ERROR_NTF(buff)).to.throw();
        });

    });
});