import { ActuatorType, splitActuatorType } from "../../src";
import { expect } from "chai";

'use strict';

describe("GW_SYSTEMTABLE", function() {
    describe("splitActuatorType", function() {
        const TestData: { 
                InputValue: number, 
                ExpectedResult: { ActuatorType: ActuatorType, ActuatorSubType: number } 
            }[] = [
                {
                    InputValue: 0x0040,
                    ExpectedResult: { ActuatorType: ActuatorType.VenetianBlind, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0080,
                    ExpectedResult: { ActuatorType: ActuatorType.RollerShutter, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0081,
                    ExpectedResult: { ActuatorType: ActuatorType.RollerShutter, ActuatorSubType: 1 }
                },
                {
                    InputValue: 0x0082,
                    ExpectedResult: { ActuatorType: ActuatorType.RollerShutter, ActuatorSubType: 2 }
                },
                {
                    InputValue: 0x00c0,
                    ExpectedResult: { ActuatorType: ActuatorType.Awning, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0100,
                    ExpectedResult: { ActuatorType: ActuatorType.WindowOpener, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0101,
                    ExpectedResult: { ActuatorType: ActuatorType.WindowOpener, ActuatorSubType: 1 }
                },
                {
                    InputValue: 0x0140,
                    ExpectedResult: { ActuatorType: ActuatorType.GarageOpener, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x017a,
                    ExpectedResult: { ActuatorType: ActuatorType.GarageOpener, ActuatorSubType: 58 }
                },
                {
                    InputValue: 0x0180,
                    ExpectedResult: { ActuatorType: ActuatorType.Light, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x01ba,
                    ExpectedResult: { ActuatorType: ActuatorType.Light, ActuatorSubType: 58 }
                },
                {
                    InputValue: 0x01c0,
                    ExpectedResult: { ActuatorType: ActuatorType.GateOpener, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x01fa,
                    ExpectedResult: { ActuatorType: ActuatorType.GateOpener, ActuatorSubType: 58 }
                },
                {
                    InputValue: 0x0240,
                    ExpectedResult: { ActuatorType: ActuatorType.Lock, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0241,
                    ExpectedResult: { ActuatorType: ActuatorType.Lock, ActuatorSubType: 1 }
                },
                {
                    InputValue: 0x0280,
                    ExpectedResult: { ActuatorType: ActuatorType.Blind, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0340,
                    ExpectedResult: { ActuatorType: ActuatorType.DualShutter, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x03c0,
                    ExpectedResult: { ActuatorType: ActuatorType.OnOffSwitch, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0400,
                    ExpectedResult: { ActuatorType: ActuatorType.HorizontalAwning, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0440,
                    ExpectedResult: { ActuatorType: ActuatorType.ExternalVentianBlind, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0480,
                    ExpectedResult: { ActuatorType: ActuatorType.LouvreBlind, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x04c0,
                    ExpectedResult: { ActuatorType: ActuatorType.CurtainTrack, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0500,
                    ExpectedResult: { ActuatorType: ActuatorType.VentilationPoint, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0501,
                    ExpectedResult: { ActuatorType: ActuatorType.VentilationPoint, ActuatorSubType: 1 }
                },
                {
                    InputValue: 0x0502,
                    ExpectedResult: { ActuatorType: ActuatorType.VentilationPoint, ActuatorSubType: 2 }
                },
                {
                    InputValue: 0x0503,
                    ExpectedResult: { ActuatorType: ActuatorType.VentilationPoint, ActuatorSubType: 3 }
                },
                {
                    InputValue: 0x0540,
                    ExpectedResult: { ActuatorType: ActuatorType.ExteriorHeating, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x057a,
                    ExpectedResult: { ActuatorType: ActuatorType.ExteriorHeating, ActuatorSubType: 58 }
                },
                {
                    InputValue: 0x0600,
                    ExpectedResult: { ActuatorType: ActuatorType.SwingingShutter, ActuatorSubType: 0 }
                },
                {
                    InputValue: 0x0601,
                    ExpectedResult: { ActuatorType: ActuatorType.SwingingShutter, ActuatorSubType: 1 }
                }
            ];

        for (const testCase of TestData) {
            it(`should return ${JSON.stringify(testCase.ExpectedResult)} for 0x${testCase.InputValue.toString(16)}`, function() {
                const result = splitActuatorType(testCase.InputValue);
                expect(result).to.eql(testCase.ExpectedResult);
            });
        }
    });
});