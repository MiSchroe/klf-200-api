"use strict";

import { GW_ERROR_NTF, Groups, GW_GET_ALL_GROUPS_INFORMATION_CFM, GW_GET_ALL_GROUPS_INFORMATION_NTF, GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF } from "../src";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MockConnection } from "./mocks/mockConnection";
import sinon, { SinonSandbox } from "sinon";
import sinonChai from "sinon-chai";

use(chaiAsPromised);
use(sinonChai);


describe("groups", function() {
    // Setup sinon sandbox
    let sandbox: SinonSandbox;

    this.beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    this.afterEach(function() {
        sandbox.restore();
    });

    describe("groups class", function () {
        // Error frame
        const dataError = Buffer.from([0x04, 0x00, 0x00, 0x07]);

        // Frames for groups list
        const dataAllNodes = Buffer.from([0x05, 0x02, 0x2a, 0x00, 0x0e]);
        const dataAllNodesCfm = new GW_GET_ALL_GROUPS_INFORMATION_CFM(dataAllNodes);

        const dataNodes = [
            Buffer.from([0x66, 0x02, 0x2b, 0x32, 0x00, 0x00, 0x00, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x53, 0xc3, 0xbc, 0x64, 0x65, 0x6e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
            Buffer.from([0x66, 0x02, 0x2b, 0x33, 0x00, 0x01, 0x00, 0x41, 0x6c, 0x6c, 0x65, 0x20, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
        ];
        const dataNodesNtf: GW_GET_ALL_GROUPS_INFORMATION_NTF[] = [];
        dataNodes.forEach(dataNode => {
            dataNodesNtf.push(new GW_GET_ALL_GROUPS_INFORMATION_NTF(dataNode));
        });
        const dataNodeFinish = Buffer.from([0x03, 0x02, 0x2c]);
        const dataNodeFinishNtf = new GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF(dataNodeFinish);

        const receivedFrames = [
            dataAllNodesCfm
        ];

        describe.only("creategroupsAsync", function() {
            it("should create without error with 2 groups.", async function() {
                const conn = new MockConnection(receivedFrames);
                const promResult = Groups.createGroupsAsync(conn);
                // Send nodes
                for (const dataNodeNtf of dataNodesNtf) {
                    conn.sendNotification(dataNodeNtf, []);
                }
                // Send finished
                conn.sendNotification(dataNodeFinishNtf, []);
                const result = await promResult;
                expect(result).to.be.instanceOf(Groups);
                expect(result.Groups.reduce((accumulator, current) => {return accumulator + (typeof current === "undefined" ? 0 : 1)}, 0)).to.be.equal(2);
            });

            it("should throw an error on invalid frames.", async function() {
                const conn = new MockConnection([]);
                return expect(Groups.createGroupsAsync(conn)).to.rejectedWith(Error);
            });
        });
        
        // describe("findByName", function() {
        //     it("should find group 'Fenster Badezimmer'.", async function() {
        //         const conn = new MockConnection(receivedFrames);
        //         const promgroups = Groups.createGroupsAsync(conn);
        //         // Send nodes
        //         for (const dataNodeNtf of dataNodesNtf) {
        //             conn.sendNotification(dataNodeNtf, []);
        //         }
        //         // Send finished
        //         conn.sendNotification(dataNodeFinishNtf, []);
        //         const groups = await promgroups;
        //         const result = groups.findByName("Fenster Badezimmer");
        //         expect(result).to.be.instanceOf(Group).with.property("Name", "Fenster Badezimmer");
        //     });
        // });
        
        // describe("onNotificationHandler", function() {
        //     it("should add 1 group and remove 2 groups.", async function() {
        //         const data = Buffer.from([55, 0x01, 0x12, 
        //             // Added nodes (0)
        //             1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //             // Removed nodes (0, 1)
        //             3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        //         ]);
        //         const dataNtf = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);
        //         const dataNodeInformation = Buffer.from([0x05, 0x02, 0x01, 0x00, 0x00]);
        //         const dataNodeInformationCfm = new GW_GET_NODE_INFORMATION_CFM(dataNodeInformation);
        //         const dataNodeInfoNotification = Buffer.from([0x7f, 0x02, 0x10, 0x00, 0x00, 0x00, 0x01, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x66, 0x00, 0x66, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00, 0x4f, 0x00, 0x4c, 0x93, 0x01, 0xd8, 0x03, 0xb2, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        //         const dataNodeInfoNotificationNtf = new GW_GET_NODE_INFORMATION_NTF(dataNodeInfoNotification);

        //         const conn = new MockConnection(receivedFrames);
        //         const promgroups = Groups.creategroupsAsync(conn);
        //         for (const dataNodeNtf of dataNodesNtf) {
        //             conn.sendNotification(dataNodeNtf, []);
        //         }
        //         // Send finished
        //         conn.sendNotification(dataNodeFinishNtf, []);
        //         const groups = await promgroups;

        //         // Setups spies for counting notifications
        //         const groupAddedSpy = sinon.spy();
        //         const groupRemovedSpy = sinon.spy();
        //         groups.onNewgroup((groupID) => {
        //             groupAddedSpy(groupID);
        //         });
        //         groups.onRemovedgroup((groupID) => {
        //             groupRemovedSpy(groupID);
        //         });

        //         conn.sendNotification(dataNtf, [dataNodeInformationCfm]);
        //         conn.sendNotification(dataNodeInfoNotificationNtf, []);

        //         // Just let the asynchronous stuff run before our checks
        //         await new Promise(resolve => { setTimeout(resolve, 0); });

        //         expect(groupAddedSpy.calledOnce, `onNewgroup should be called once. Instead it was called ${groupAddedSpy.callCount} times.`).to.be.true;
        //         expect(groupRemovedSpy.calledTwice, `onRemovedgroup should be called twice. Instead it was called ${groupRemovedSpy.callCount} times.`).to.be.true;
        //     });
        // });
        
        // describe("addNodeAsync", function() {
        //     it("should throw on error frame.", async function() {
        //         const data = Buffer.from([55, 0x01, 0x12, 
        //             // Added nodes (0)
        //             1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //             // Removed nodes (0, 1)
        //             3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        //         ]);
        //         const dataNtf = new GW_CS_SYSTEM_TABLE_UPDATE_NTF(data);
        //         const dataNodeInformation = Buffer.from([0x05, 0x02, 0x01, 0x00, 0x00]);
        //         const dataNodeInfoNotification = Buffer.from([0x7f, 0x02, 0x10, 0x00, 0x00, 0x00, 0x01, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d, 0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0xd5, 0x07, 0x00, 0x01, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x66, 0x00, 0x66, 0x00, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0xf7, 0xff, 0x00, 0x00, 0x4f, 0x00, 0x4c, 0x93, 0x01, 0xd8, 0x03, 0xb2, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

        //         const conn = new MockConnection(receivedFrames);
        //         const promgroups = Groups.createGroupsAsync(conn);
        //         for (const dataNodeNtf of dataNodesNtf) {
        //             conn.sendNotification(dataNodeNtf, []);
        //         }
        //         // Send finished
        //         conn.sendNotification(dataNodeFinishNtf, []);
        //         const groups = await promgroups;

        //         // Setups spies for counting notifications
        //         const groupAddedSpy = sinon.spy();
        //         const groupRemovedSpy = sinon.spy();
        //         // groups.onNewgroup((groupID) => {
        //         //     groupAddedSpy(groupID);
        //         // });
        //         // groups.onRemovedgroup((groupID) => {
        //         //     groupRemovedSpy(groupID);
        //         // });

        //         conn.sendNotification(dataNtf, [dataErrorNtf]);

        //         // Just let the asynchronous stuff run before our checks
        //         await new Promise(resolve => { setTimeout(resolve, 0); });

        //         expect(groupAddedSpy.notCalled, `onNewgroup shouldn't be called at all. Instead it was called ${groupAddedSpy.callCount} times.`).to.be.true;
        //         expect(groupRemovedSpy.calledTwice, `onRemovedgroup should be called twice. Instead it was called ${groupRemovedSpy.callCount} times.`).to.be.true;
        //     });
        // });

        // describe("group class", function() {
        //     /* Setup is the same for all test cases */
        //     let conn: MockConnection;
        //     let groups: groups;
        //     let group: group;
        //     this.beforeEach(async () => {
        //         conn = new MockConnection(receivedFrames);
        //         const promResult = groups.creategroupsAsync(conn);
        //         // Send nodes
        //         for (const dataNodeNtf of dataNodesNtf) {
        //             conn.sendNotification(dataNodeNtf, []);
        //         }
        //         // Send finished
        //         conn.sendNotification(dataNodeFinishNtf, []);
        //         groups = await promResult;
        //         group = groups.groups[0];     // Use the first group for all tests
        //     });

        //     describe("Name", function() {
        //         it("should return the group name", function() {
        //             const expectedResult = "Fenster Badezimmer";
        //             const result = group.Name;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("Category", function() {
        //         [
        //             { nodeType: 0x0040, category: "Interior venetian blind" },
        //             { nodeType: 0x0080, category: "Roller shutter" },
        //             { nodeType: 0x0081, category: "Adjustable slats roller shutter" },
        //             { nodeType: 0x0082, category: "Roller shutter with projection" },
        //             { nodeType: 0x00C0, category: "Vertical exterior awning" },
        //             { nodeType: 0x0100, category: "Window opener" },
        //             { nodeType: 0x0101, category: "Window opener with integrated rain sensor" },
        //             { nodeType: 0x0140, category: "Garage door opener" },
        //             { nodeType: 0x017A, category: "Garage door opener" },
        //             { nodeType: 0x0180, category: "Light" },
        //             { nodeType: 0x01BA, category: "Light" },
        //             { nodeType: 0x01C0, category: "Gate opener" },
        //             { nodeType: 0x01FA, category: "Gate opener" },
        //             { nodeType: 0x0240, category: "Door lock" },
        //             { nodeType: 0x0241, category: "Window lock" },
        //             { nodeType: 0x0280, category: "Vertical interior blind" },
        //             { nodeType: 0x0340, category: "Dual roller shutter" },
        //             { nodeType: 0x03C0, category: "On/Off switch" },
        //             { nodeType: 0x0400, category: "Horizontal awning" },
        //             { nodeType: 0x0440, category: "Exterior venetion blind" },
        //             { nodeType: 0x0480, category: "Louvre blind" },
        //             { nodeType: 0x04C0, category: "Curtain track" },
        //             { nodeType: 0x0500, category: "Ventilation point" },
        //             { nodeType: 0x0501, category: "Air inlet" },
        //             { nodeType: 0x0502, category: "Air transfer" },
        //             { nodeType: 0x0503, category: "Air outlet" },
        //             { nodeType: 0x0540, category: "Exterior heating" },
        //             { nodeType: 0x057A, category: "Exterior heating" },
        //             { nodeType: 0x0600, category: "Swinging shutter" },
        //             { nodeType: 0x0601, category: "Swinging shutter with independent handling of the leaves" },
        //             { nodeType: 0x0000, category: "0.0" }
        //         ].forEach((category) => {
        //             it(`should return the group category ${category.category}`, function() {
        //                 const dataTest = Buffer.from(dataNodes[0]);
        //                 // Setup node type
        //                 dataTest.writeUInt16BE(category.nodeType, 72);
        //                 const dataTestNtf = new GW_GET_ALL_NODES_INFORMATION_NTF(dataTest);
        //                 const groupTest = new group(conn, dataTestNtf);
        //                 const expectedResult = category.category;
        //                 const result = groupTest.Category;
    
        //                 expect(result).to.be.equal(expectedResult);
        //             });
        //         });
        //     });

        //     describe("NodeVariation", function() {
        //         it("should return the node variation", function() {
        //             const expectedResult = NodeVariation.NotSet;
        //             const result = group.NodeVariation;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("Order", function() {
        //         it("should return the node's order", function() {
        //             const expectedResult = 0;
        //             const result = group.Order;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("Placement", function() {
        //         it("should return the node's placement", function() {
        //             const expectedResult = 1;
        //             const result = group.Placement;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("State", function() {
        //         it("should return the node's operating state", function() {
        //             const expectedResult = NodeOperatingState.Done;
        //             const result = group.State;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("CurrentPositionRaw", function() {
        //         it("should return the node's current position raw value", function() {
        //             const expectedResult = 0xC800;
        //             const result = group.CurrentPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("TargetPositionRaw", function() {
        //         it("should return the node's target position raw value", function() {
        //             const expectedResult = 0xC800;
        //             const result = group.TargetPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("FP1CurrentPositionRaw", function() {
        //         it("should return the node's functional parameter 1 position raw value", function() {
        //             const expectedResult = 0xF7FF;
        //             const result = group.FP1CurrentPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("FP2CurrentPositionRaw", function() {
        //         it("should return the node's functional parameter 2 position raw value", function() {
        //             const expectedResult = 0xF7FF;
        //             const result = group.FP2CurrentPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("FP3CurrentPositionRaw", function() {
        //         it("should return the node's functional parameter 3 position raw value", function() {
        //             const expectedResult = 0xF7FF;
        //             const result = group.FP3CurrentPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("FP4CurrentPositionRaw", function() {
        //         it("should return the node's functional parameter 4 position raw value", function() {
        //             const expectedResult = 0xF7FF;
        //             const result = group.FP4CurrentPositionRaw;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("RemainingTime", function() {
        //         it("should return the node's remaining time for the current operation", function() {
        //             const expectedResult = 0;
        //             const result = group.RemainingTime;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("TimeStamp", function() {
        //         it("should return the node's timestamp of the current data", function() {
        //             const expectedResult = new Date("2012-01-01T11:13:55.000Z");
        //             const result = group.TimeStamp;

        //             expect(result).to.be.deep.equal(expectedResult);
        //         });
        //     });

        //     describe("RunStatus", function() {
        //         it("should return the node's run status", function() {
        //             const expectedResult = RunStatus.ExecutionCompleted;
        //             const result = group.RunStatus;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("StatusReply", function() {
        //         it("should return the node's status reply", function() {
        //             const expectedResult = StatusReply.Unknown;
        //             const result = group.StatusReply;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("CurrentPosition", function() {
        //         it("should return the node's interpreted current position", function() {
        //             const expectedResult = 0;
        //             const result = group.CurrentPosition;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("TargetPosition", function() {
        //         it("should return the node's interpreted target position", function() {
        //             const expectedResult = 0;
        //             const result = group.TargetPosition;

        //             expect(result).to.be.equal(expectedResult);
        //         });
        //     });

        //     describe("setNameAsync", function() {
        //         it("should send a set node name request", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x09, 0x00, 0]);
        //             const dataCfm = new GW_SET_NODE_NAME_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setNameAsync("New name");

        //             return expect(result).to.be.fulfilled;
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x09, 0x01, 0]);
        //             const dataCfm = new GW_SET_NODE_NAME_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setNameAsync("New name");

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.setNameAsync("New name");

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("setNodeVariationAsync", function() {
        //         it("should send a set node variation request", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x07, 0x00, 0]);
        //             const dataCfm = new GW_SET_NODE_VARIATION_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setNodeVariationAsync(NodeVariation.Kip);

        //             return expect(result).to.be.fulfilled;
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x07, 0x01, 0]);
        //             const dataCfm = new GW_SET_NODE_VARIATION_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setNodeVariationAsync(NodeVariation.Kip);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.setNodeVariationAsync(NodeVariation.Kip);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("setOrderAndPlacementAsync", function() {
        //         it("should send a set order and placement request", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x0E, 0x00, 0]);
        //             const dataCfm = new GW_SET_NODE_ORDER_AND_PLACEMENT_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setOrderAndPlacementAsync(1, 2);

        //             return expect(result).to.be.fulfilled;
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x05, 0x02, 0x0E, 0x01, 0]);
        //             const dataCfm = new GW_SET_NODE_ORDER_AND_PLACEMENT_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setOrderAndPlacementAsync(1, 2);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.setOrderAndPlacementAsync(1, 2);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("setOrderAsync", function() {
        //         it("should call setOrderAndPlacementAsync", async function() {
        //             const expectedResult = 42;
        //             const setOrderAndPlacementAsyncStub = sandbox.stub(group, "setOrderAndPlacementAsync").resolves();

        //             const result = group.setOrderAsync(expectedResult);
        //             expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(expectedResult, group.Placement);
        //             return expect(result).to.be.fulfilled;
        //         });
        //     });

        //     describe("setPlacementAsync", function() {
        //         it("should call setOrderAndPlacementAsync", async function() {
        //             const expectedResult = 42;
        //             const setOrderAndPlacementAsyncStub = sandbox.stub(group, "setOrderAndPlacementAsync").resolves();

        //             const result = group.setPlacementAsync(expectedResult);
        //             expect(setOrderAndPlacementAsyncStub).to.be.calledOnceWithExactly(group.Order, expectedResult);
        //             return expect(result).to.be.fulfilled;
        //         });
        //     });

        //     describe("setTargetPositionAsync", function() {
        //         it("should send a command request", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
        //             const dataCfm = new GW_COMMAND_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setTargetPositionAsync(0.42);

        //             return expect(result).to.be.eventually.equal(0x4711);
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
        //             const dataCfm = new GW_COMMAND_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.setTargetPositionAsync(0.42);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.setTargetPositionAsync(0.42);

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("stopAsync", function() {
        //         it("should send a command request", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x01]);
        //             const dataCfm = new GW_COMMAND_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.stopAsync();

        //             return expect(result).to.be.eventually.equal(0x4711);
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x01, 0x47, 0x11, 0x00]);
        //             const dataCfm = new GW_COMMAND_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.stopAsync();

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.stopAsync();

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("winkAsync", function() {
        //         it("should send a command request", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x01]);
        //             const dataCfm = new GW_WINK_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.winkAsync();

        //             return expect(result).to.be.eventually.equal(0x4711);
        //         });

        //         it("should reject on error status", async function() {
        //             const data = Buffer.from([0x06, 0x03, 0x09, 0x47, 0x11, 0x00]);
        //             const dataCfm = new GW_WINK_SEND_CFM(data);

        //             // Mock request
        //             conn.valueToReturn.push(dataCfm);

        //             const result = group.winkAsync();

        //             return expect(result).to.be.rejectedWith(Error);
        //         });

        //         it("should reject on error frame", async function() {
        //             // Mock request
        //             conn.valueToReturn.push(dataErrorNtf);

        //             const result = group.winkAsync();

        //             return expect(result).to.be.rejectedWith(Error);
        //         });
        //     });

        //     describe("onNotificationHandler", function() {
        //         let propertyChangedSpy: SinonSpy<PropertyChangedEvent[]>;

        //         this.beforeEach(function() {
        //             propertyChangedSpy = sandbox.spy();
        //             group.propertyChangedEvent.on((event) => {
        //                 propertyChangedSpy(event);
        //             });
        //         });

        //         describe("GW_NODE_INFORMATION_CHANGED_NTF", function() {
        //             it("should send notifications for Name, NodeVariation, Order and Placement", function() {
        //                 const data = Buffer.from([72, 0x02, 0x0C, 
        //                     // Node ID
        //                     0,
        //                     // Name
        //                     0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     // Order
        //                     0x00, 0x02,
        //                     // Placement
        //                     3,
        //                     // Node Variation
        //                     2  // KIP
        //                 ]);
        //                 const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "Name").to.be.calledWithMatch({o: group, propertyName: "Name", propertyValue: "Dummy"});
        //                 expect(propertyChangedSpy, "NodeVariation").to.be.calledWithMatch({o: group, propertyName: "NodeVariation", propertyValue: NodeVariation.Kip});
        //                 expect(propertyChangedSpy, "Order").to.be.calledWithMatch({o: group, propertyName: "Order", propertyValue: 2});
        //                 expect(propertyChangedSpy, "Placement").to.be.calledWithMatch({o: group, propertyName: "Placement", propertyValue: 3});
        //             });

        //             it("should send notifications for Name only", function() {
        //                 const data = Buffer.from([72, 0x02, 0x0C, 
        //                     // Node ID
        //                     0,
        //                     // Name
        //                     0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     // Order
        //                     0x00, 0x00,
        //                     // Placement
        //                     1,
        //                     // Node Variation
        //                     0
        //                 ]);
        //                 const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "Name").to.be.calledOnceWith(sinon.match({o: group, propertyName: "Name", propertyValue: "Dummy"}));
        //             });

        //             it("shouldn't send any notifications", function() {
        //                 const data = Buffer.from([72, 0x02, 0x0C, 
        //                     // Node ID
        //                     0,
        //                     // Name
        //                     0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20,
        //                     0x42, 0x61, 0x64, 0x65, 0x7a, 0x69, 0x6d, 0x6d,
        //                     0x65, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        //                     // Order
        //                     0x00, 0x00,
        //                     // Placement
        //                     1,
        //                     // Node Variation
        //                     0
        //                 ]);
        //                 const dataNtf = new GW_NODE_INFORMATION_CHANGED_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy).not.to.be.called;
        //             });
        //         });

        //         describe("GW_NODE_STATE_POSITION_CHANGED_NTF", function() {
        //             it("should send notifications for State, CurrentPositionRaw, CurrentPosition, TargetPositionRaw, TargetPosition, FP1CurrentPositionRaw, FP2CurrentPositionRaw, FP3CurrentPositionRaw, FP4CurrentPositionRaw, RemainingTime, TimeStamp", function() {
        //                 const data = Buffer.from([23, 0x02, 0x11, 
        //                     // Node ID
        //                     0,
        //                     // State
        //                     4,  // Executing
        //                     // Current Position
        //                     0xC0, 0x00,
        //                     // Target
        //                     0xC7, 0x00,
        //                     // FP1 Current Position
        //                     0xF7, 0xFE,
        //                     // FP2 Current Position
        //                     0xF7, 0xFE,
        //                     // FP3 Current Position
        //                     0xF7, 0xFE,
        //                     // FP4 Current Position
        //                     0xF7, 0xFE,
        //                     // Remaining Time
        //                     0, 5,
        //                     // Time stamp
        //                     0x00, 0xF9, 0x39, 0x90
        //                 ]);
        //                 const dataNtf = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "State").to.be.calledWithMatch({o: group, propertyName: "State", propertyValue: NodeOperatingState.Executing});
        //                 expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "CurrentPosition").to.be.calledWithMatch({o: group, propertyName: "CurrentPosition", propertyValue: 0.040000000000000036});
        //                 expect(propertyChangedSpy, "TargetPositionRaw").to.be.calledWithMatch({o: group, propertyName: "TargetPositionRaw", propertyValue: 0xC700});
        //                 expect(propertyChangedSpy, "TargetPosition").to.be.calledWithMatch({o: group, propertyName: "TargetPosition", propertyValue: 0.0050000000000000044});
        //                 expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP1CurrentPositionRaw", propertyValue: 0xF7FE});
        //                 expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP2CurrentPositionRaw", propertyValue: 0xF7FE});
        //                 expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP3CurrentPositionRaw", propertyValue: 0xF7FE});
        //                 expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP4CurrentPositionRaw", propertyValue: 0xF7FE});
        //                 expect(propertyChangedSpy, "RemainingTime").to.be.calledWithMatch({o: group, propertyName: "RemainingTime", propertyValue: 5});
        //                 expect(propertyChangedSpy, "TimeStamp").to.be.calledWithMatch({o: group, propertyName: "TimeStamp", propertyValue: new Date("1970-07-09 02:00:00 GMT+0100")});
        //             });

        //             it("shouldn't send any notifications", function() {
        //                 const data = Buffer.from([23, 0x02, 0x11, 
        //                     // Node ID
        //                     0,
        //                     // State
        //                     5,  // Done
        //                     // Current Position
        //                     0xC8, 0x00,
        //                     // Target
        //                     0xC8, 0x00,
        //                     // FP1 Current Position
        //                     0xF7, 0xFF,
        //                     // FP2 Current Position
        //                     0xF7, 0xFF,
        //                     // FP3 Current Position
        //                     0xF7, 0xFF,
        //                     // FP4 Current Position
        //                     0xF7, 0xFF,
        //                     // Remaining Time
        //                     0, 0,
        //                     // Time stamp
        //                     0x4f, 0x00, 0x3f, 0xf3
        //                 ]);
        //                 const dataNtf = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy).not.to.be.called;
        //             });
        //         });

        //         describe("GW_COMMAND_RUN_STATUS_NTF", function() {
        //             it("should send notifications for CurrentPositionRaw, CurrentPosition, RunStatus, StatusReply", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x00, 0xC0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "CurrentPosition").to.be.calledWithMatch({o: group, propertyName: "CurrentPosition", propertyValue: 0.040000000000000036});
        //                 expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({o: group, propertyName: "RunStatus", propertyValue: RunStatus.ExecutionActive});
        //                 expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({o: group, propertyName: "StatusReply", propertyValue: StatusReply.Ok});
        //             });

        //             it("should send notifications for FP1CurrentPositionRaw, RunStatus, StatusReply", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x01, 0xC0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "FP1CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP1CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({o: group, propertyName: "RunStatus", propertyValue: RunStatus.ExecutionActive});
        //                 expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({o: group, propertyName: "StatusReply", propertyValue: StatusReply.Ok});
        //             });

        //             it("should send notifications for FP2CurrentPositionRaw, RunStatus, StatusReply", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x02, 0xC0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "FP2CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP2CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({o: group, propertyName: "RunStatus", propertyValue: RunStatus.ExecutionActive});
        //                 expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({o: group, propertyName: "StatusReply", propertyValue: StatusReply.Ok});
        //             });

        //             it("should send notifications for FP3CurrentPositionRaw, RunStatus, StatusReply", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x03, 0xC0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "FP3CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP3CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({o: group, propertyName: "RunStatus", propertyValue: RunStatus.ExecutionActive});
        //                 expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({o: group, propertyName: "StatusReply", propertyValue: StatusReply.Ok});
        //             });

        //             it("should send notifications for FP4CurrentPositionRaw, RunStatus, StatusReply", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x04, 0xC0, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "FP4CurrentPositionRaw").to.be.calledWithMatch({o: group, propertyName: "FP4CurrentPositionRaw", propertyValue: 0xC000});
        //                 expect(propertyChangedSpy, "RunStatus").to.be.calledWithMatch({o: group, propertyName: "RunStatus", propertyValue: RunStatus.ExecutionActive});
        //                 expect(propertyChangedSpy, "StatusReply").to.be.calledWithMatch({o: group, propertyName: "StatusReply", propertyValue: StatusReply.Ok});
        //             });

        //             it("shouldn't send any notifications", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x02, 0x47, 0x11, 0x02, 0x00, 0x00, 0xC8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_RUN_STATUS_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy).not.to.be.called;
        //             });
        //         });

        //         describe("GW_COMMAND_REMAINING_TIME_NTF", function() {
        //             it("should send notifications for RemainingTime", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x00, 0x00, 0x00, 0x2A]);
        //                 const dataNtf = new GW_COMMAND_REMAINING_TIME_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy, "RemainingTime").to.be.calledWithMatch({o: group, propertyName: "RemainingTime", propertyValue: 42});
        //             });

        //             it("shouldn't send any notifications", function() {
        //                 const data = Buffer.from([0x06, 0x03, 0x03, 0x47, 0x11, 0x00, 0x00, 0x00, 0x00]);
        //                 const dataNtf = new GW_COMMAND_REMAINING_TIME_NTF(data);
    
        //                 conn.sendNotification(dataNtf, []);
    
        //                 expect(propertyChangedSpy).not.to.be.called;
        //             });
        //         });
        //     });
        // });
    });
});
