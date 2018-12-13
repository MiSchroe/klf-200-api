'use strict';

import { expect } from "chai";
import { LockTime, convertPositionRaw, convertPosition } from "../../src/KLF200-API/GW_COMMAND";
import { ActuatorType } from "../../src/KLF200-API/GW_SYSTEMTABLE_DATA";

describe("GW_COMMAND", function() {
    describe("LockTime", function() {
        describe("lockTimeValueToLockTime", function() {
            it("should return 30 for input value 0", function() {
                const inputValue = 0;
                const expectedValue = 30;
                const result = LockTime.lockTimeValueToLockTime(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should return 1290 for input value 42", function() {
                const inputValue = 42;
                const expectedValue = 1290;
                const result = LockTime.lockTimeValueToLockTime(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should return +infinity for input value 255", function() {
                const inputValue = 255;
                const expectedValue = Infinity;
                const result = LockTime.lockTimeValueToLockTime(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should throw on a negative input value", function() {
                const inputValue = -1;

                expect(() => LockTime.lockTimeValueToLockTime(inputValue)).to.throw;
            });

            it("should throw on an input value greater than 255", function() {
                const inputValue = 256;

                expect(() => LockTime.lockTimeValueToLockTime(inputValue)).to.throw;
            });
        });

        describe("lockTimeTolockTimeValue", function() {
            it("should return 0 for input value 30", function() {
                const inputValue = 30;
                const expectedValue = 0;
                const result = LockTime.lockTimeTolockTimeValue(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should return 42 for input value 1290", function() {
                const inputValue = 1290;
                const expectedValue = 42;
                const result = LockTime.lockTimeTolockTimeValue(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should return 255 for input value +infinity", function() {
                const inputValue = Infinity;
                const expectedValue = 255;
                const result = LockTime.lockTimeTolockTimeValue(inputValue);

                expect(result).to.equal(expectedValue);
            });

            it("should throw on a negative input value", function() {
                const inputValue = -1;

                expect(() => LockTime.lockTimeTolockTimeValue(inputValue)).to.throw;
            });

            it("should throw on an input value greater than 7560", function() {
                const inputValue = 7561;

                expect(() => LockTime.lockTimeTolockTimeValue(inputValue)).to.throw;
            });

            it("should throw on an input value not dividable by 30", function() {
                const inputValue = 31;

                expect(() => LockTime.lockTimeTolockTimeValue(inputValue)).to.throw;
            });
        });
    });

    describe("convertPositionRaw", function() {
        it("should return 0 for 0x0000 for a roller shutter", function() {
            const inputValue = 0x0000;
            const expectedValue = 0;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 1 for 0xC800 for a roller shutter", function() {
            const inputValue = 0xC800;
            const expectedValue = 1;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0.1 for 0x1400 for a roller shutter", function() {
            const inputValue = 0x1400;
            const expectedValue = 0.1;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return NaN for a value greater than 0xC800 for a roller shutter", function() {
            const inputValue = 0xC801;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.be.NaN;
        });

        it("should return 1 for 0x0000 for a window opener", function() {
            const inputValue = 0x0000;
            const expectedValue = 1;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0 for 0xC800 for a window opener", function() {
            const inputValue = 0xC800;
            const expectedValue = 0;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0.9 for 0x1400 for a window opener", function() {
            const inputValue = 0x1400;
            const expectedValue = 0.9;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return NaN for a value greater than 0xC800 for a window opener", function() {
            const inputValue = 0xC801;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPositionRaw(inputValue, actuatorType);

            expect(result).to.be.NaN;
        });
    });

    describe("convertPosition", function() {
        it("should return 0x0000 for 0 for a roller shutter", function() {
            const inputValue = 0;
            const expectedValue = 0x0000;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0xC800 for 1 for a roller shutter", function() {
            const inputValue = 1;
            const expectedValue = 0xC800;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0x1400 for 0.1 for a roller shutter", function() {
            const inputValue = 0.1;
            const expectedValue = 0x1400;
            const actuatorType = ActuatorType.RollerShutter;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should throw an error for negative values for a roller shutter", function() {
            const inputValue = -0.1;
            const actuatorType = ActuatorType.RollerShutter;

            expect(() => convertPosition(inputValue, actuatorType)).to.throw;
        });

        it("should throw an error for values larger than 1.0 for a roller shutter", function() {
            const inputValue = 1.1;
            const actuatorType = ActuatorType.RollerShutter;

            expect(() => convertPosition(inputValue, actuatorType)).to.throw;
        });

        it("should return 0x0000 for 1 for a window opener", function() {
            const inputValue = 1;
            const expectedValue = 0x0000;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0xC800 for 0 for a window opener", function() {
            const inputValue = 0;
            const expectedValue = 0xC800;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should return 0x1400 for 0.9 for a window opener", function() {
            const inputValue = 0.9;
            const expectedValue = 0x1400;
            const actuatorType = ActuatorType.WindowOpener;
            const result = convertPosition(inputValue, actuatorType);

            expect(result).to.equal(expectedValue);
        });

        it("should throw an error for negative values for a window opener", function() {
            const inputValue = -0.1;
            const actuatorType = ActuatorType.WindowOpener;

            expect(() => convertPosition(inputValue, actuatorType)).to.throw;
        });

        it("should throw an error for values larger than 1.0 for a window opener", function() {
            const inputValue = 1.1;
            const actuatorType = ActuatorType.WindowOpener;

            expect(() => convertPosition(inputValue, actuatorType)).to.throw;
        });
    });
});