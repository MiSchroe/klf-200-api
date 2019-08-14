"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GET_CONTACT_INPUT_LINK_LIST_CFM, CommandOriginator, PriorityLevel, LockPriorityLevel, ContactInputAssignment, ParameterActive, Velocity } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_CONTACT_INPUT_LINK_LIST_CFM", function() {
        describe("Constructor", function() {
            const data = Buffer.from([174, 0x04, 0x61, 
                // # of objects
                1,
                
                /* Contact input #1 */
                // Contact input ID
                0,
                // Contact input assignment
                1,  // Scene
                // Scene ID
                2,
                // Command originator
                1,  // User
                // Priority level
                2,  // User level 1
                // Parameter ID
                0,  // Main parameter
                // Position
                0xC4, 0x00,
                // Velocity
                0,  // DEFAULT
                // Lock priority level
                1,
                // PLI3
                3,
                // PLI4
                4,
                // PLI5
                5,
                // PLI6
                6,
                // PLI7
                7,
                // Success output ID
                1,  // Pin 1
                // Error output ID
                0,

                // Remaining contact input info records filled with zeros
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]);

            it("should create without error", function() {
                expect(() => new GW_GET_CONTACT_INPUT_LINK_LIST_CFM(data)).not.to.throw();
            });

            it("should return an array with one contact input object", function() {
                const result = new GW_GET_CONTACT_INPUT_LINK_LIST_CFM(data);
                expect(result.ContactInputObjects).to.be.instanceOf(Array);
                expect(result.ContactInputObjects.length).to.equal(1);
                expect(result.ContactInputObjects[0]).to.deep.equal({
                    ContactInputID: 0,
                    ContactInputAssignment: ContactInputAssignment.Scene,
                    ActionID: 2,
                    CommandOriginator: CommandOriginator.User,
                    PriorityLevel: PriorityLevel.UserLevel1,
                    ParameterActive: ParameterActive.MP,
                    Position: 0xC400,
                    Velocity: Velocity.Default,
                    LockPriorityLevel: LockPriorityLevel.Lock30Min,
                    PLI3: 3,
                    PLI4: 4,
                    PLI5: 5,
                    PLI6: 6,
                    PLI7: 7,
                    SuccessOutputID: 1,
                    ErrorOutputID: 0
                });
            });
        });
    });
});