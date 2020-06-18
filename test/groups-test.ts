"use strict";

import { GW_ERROR_NTF, Groups, GW_GET_ALL_GROUPS_INFORMATION_CFM, GW_GET_ALL_GROUPS_INFORMATION_NTF, GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, Group, GW_GROUP_INFORMATION_CHANGED_NTF, Velocity, NodeVariation, GroupType, GW_SET_GROUP_INFORMATION_CFM, GW_GET_NODE_INFORMATION_CFM, GW_GET_NODE_INFORMATION_NTF } from "../src";
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
    let unhandledRejectionHandler;

    this.beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    this.afterEach(function() {
        sandbox.restore();
    });

    describe("groups class", function () {
        // Error frame
        const dataError = Buffer.from([0x04, 0x00, 0x00, 0x07]);
        const dataErrorNtf = new GW_ERROR_NTF(dataError);

        // Frames for groups list
        const dataAllNodes = Buffer.from([0x05, 0x02, 0x2a, 0x00, 0x0e]);
        const dataAllNodesCfm = new GW_GET_ALL_GROUPS_INFORMATION_CFM(dataAllNodes);
        const dataAllNodesEmptyGroups = Buffer.from([0x05, 0x02, 0x2a, 0x00, 0x00]);
        const dataAllNodesCfmEmptyGroups = new GW_GET_ALL_GROUPS_INFORMATION_CFM(dataAllNodesEmptyGroups);

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

        const receivedFramesEmptyGroups = [
            dataAllNodesCfmEmptyGroups
        ];

        // A function simplifes the test setup for regular group tests
        const createRegularGroups = async function(): Promise<Groups> {
            const conn = new MockConnection(receivedFrames);
            const promResult = Groups.createGroupsAsync(conn);
            // Send nodes
            for (const dataNodeNtf of dataNodesNtf) {
                conn.sendNotification(dataNodeNtf, []);
            }
            // Send finished
            conn.sendNotification(dataNodeFinishNtf, []);
            return await promResult;
        };

        // A function simplifes the test setup for empty group tests
        const createEmptyGroups = async function(): Promise<Groups> {
            const conn = new MockConnection(receivedFramesEmptyGroups);
            const promResult = Groups.createGroupsAsync(conn);
            return await promResult;
        };

        describe("creategroupsAsync", function() {
            it("should create without error with 2 groups.", async function() {
                const result = await createRegularGroups();
                expect(result).to.be.instanceOf(Groups);
                expect(result.Groups.reduce((accumulator, current) => {return accumulator + (typeof current === "undefined" ? 0 : 1)}, 0)).to.be.equal(2);
            });

            it("should throw an error on invalid frames.", async function() {
                const conn = new MockConnection([]);
                return expect(Groups.createGroupsAsync(conn)).to.rejectedWith(Error);
            });

            it("should create without error without groups.", async function() {
                const result = await createEmptyGroups();
                expect(result).to.be.instanceOf(Groups);
                expect(result.Groups.reduce((accumulator, current) => {return accumulator + (typeof current === "undefined" ? 0 : 1)}, 0)).to.be.equal(0);
            });
        });
        
        describe("findByName", function() {
            it("should find group 'Fenster Süden'.", async function() {
                const expectedGroupName = "Fenster Süden";
                const groups = await createRegularGroups();
                const result = groups.findByName(expectedGroupName);
                expect(result).to.be.instanceOf(Group).with.property("Name", expectedGroupName);
            });
        });
        
        describe("onNotificationHandler", function() {
            it("should remove 1 group.", async function() {
                const data = Buffer.from([5, 0x02, 0x24, 
                    // Change type
                    0,  // Deleted
                    // Group ID
                    51
                ]);
                const dataNtf = new GW_GROUP_INFORMATION_CHANGED_NTF(data);
                const groups = await createRegularGroups();
                const conn = groups.Connection as MockConnection;

                // Setups spies for counting notifications
                const groupRemovedSpy = sinon.spy();
                groups.onRemovedGroup((groupID) => {
                    groupRemovedSpy(groupID);
                });

                conn.sendNotification(dataNtf, []);

                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                expect(groupRemovedSpy, `onRemovedgroup should be called once. Instead it was called ${groupRemovedSpy.callCount} times.`).to.be.calledOnceWith(51);
                expect(groups.Groups[51]).to.be.undefined;
            });

            it("should change 1 group.", async function() {
                const expectedGroup = { GroupID: 51, Name: "Fenster Süde", Order: 2, Placement: 3, Velocity: Velocity.Silent, NodeVariation: NodeVariation.Kip, GroupType: GroupType.Room, Nodes: []};
                const data = Buffer.from([103, 0x02, 0x24, 1, 0x33, 0x00, 0x02, 0x03, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x53, 0xc3, 0xbc, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                const dataNtf = new GW_GROUP_INFORMATION_CHANGED_NTF(data);
                const groups = await createRegularGroups();
                const conn = groups.Connection as MockConnection;

                // Setups spies for counting notifications
                const groupChangedSpy = sinon.spy();
                groups.onChangedGroup((groupID) => {
                    groupChangedSpy(groupID);
                });

                conn.sendNotification(dataNtf, []);

                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                expect(groupChangedSpy, `onChangedGroup should be called once. Instead it was called ${groupChangedSpy.callCount} times.`).to.be.calledOnceWith(51);
                expect(groups.Groups[51]).to.deep.include(expectedGroup);
            });

            it("should add 1 group.", async function() {
                const expectedGroup = { GroupID: 55, Name: "Fenster Süden", Order: 1};
                const data = Buffer.from([103, 0x02, 0x24, 1, 0x37, 0x00, 0x01, 0x00, 0x46, 0x65, 0x6e, 0x73, 0x74, 0x65, 0x72, 0x20, 0x53, 0xc3, 0xbc, 0x64, 0x65, 0x6e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                const dataNtf = new GW_GROUP_INFORMATION_CHANGED_NTF(data);
                const groups = await createRegularGroups();
                const conn = groups.Connection as MockConnection;

                // Setups spies for counting notifications
                const groupChangedSpy = sinon.spy();
                groups.onChangedGroup((groupID) => {
                    groupChangedSpy(groupID);
                });

                conn.sendNotification(dataNtf, []);

                // Just let the asynchronous stuff run before our checks
                await new Promise(resolve => { setTimeout(resolve, 0); });

                expect(groupChangedSpy, `onChangedGroup should be called once. Instead it was called ${groupChangedSpy.callCount} times.`).to.be.calledOnceWith(55);
                expect(groups.Groups[55]).to.include(expectedGroup);
            });
        });
        
        describe("group class", function() {
            /* Setup is the same for all test cases */
            let conn: MockConnection;
            let groups: Groups;
            let group: Group;
            this.beforeEach(async () => {
                groups = await createRegularGroups();
                conn = groups.Connection as MockConnection;
                group = groups.Groups[51];     // Use the group 51 for all tests
            });

            describe("Name", function() {
                it("should return the group name", function() {
                    const expectedResult = "Alle Fenster";
                    const result = group.Name;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("Order", function() {
                it("should return the group's order", function() {
                    const expectedResult = 1;
                    const result = group.Order;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("Placement", function() {
                it("should return the group's placement", function() {
                    const expectedResult = 0;
                    const result = group.Placement;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("Velocity", function() {
                it("should return the group's Velocity", function() {
                    const expectedResult = Velocity.Default;
                    const result = group.Velocity;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("NodeVariation", function() {
                it("should return the group's NodeVariation", function() {
                    const expectedResult = NodeVariation.NotSet;
                    const result = group.NodeVariation;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("GroupType", function() {
                it("should return the group's GroupType", function() {
                    const expectedResult = GroupType.UserGroup;
                    const result = group.GroupType;

                    expect(result).to.be.equal(expectedResult);
                });
            });

            describe("Nodes", function() {
                it("should return the group's Nodes", function() {
                    const expectedResult = [0, 1, 2, 4];
                    const result = group.Nodes;

                    expect(result).to.have.members(expectedResult);
                });
            });

            describe("changeGroupAsync", function() {
                it("should fulfill if all properties are set to different values", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

                    return expect(result).to.be.fulfilled;
                });

                it("should fulfill if all properties are set to same values", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.changeGroupAsync(group.Order, group.Placement, group.Name, group.Velocity, group.NodeVariation, [...group.Nodes]);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.changeGroupAsync(4, 7, "Some windows", Velocity.Silent, NodeVariation.Kip, [2, 4]);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setNameAsync", function() {
                it("should send a set group information request with changed name", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNameAsync("New name");

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNameAsync("New name");

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setNameAsync("New name");

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setOrderAsync", function() {
                it("should send a set group information request with changed order", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setOrderAsync(42);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setOrderAsync(42);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setOrderAsync(42);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setPlacementAsync", function() {
                it("should send a set group information request with changed placement", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setPlacementAsync(42);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setPlacementAsync(42);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setPlacementAsync(42);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setVelocityAsync", function() {
                it("should send a set group information request with changed velocity", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setVelocityAsync(Velocity.Fast);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setVelocityAsync(Velocity.Fast);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setVelocityAsync(Velocity.Fast);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setNodeVariationAsync", function() {
                it("should send a set group information request with changed node variation", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNodeVariationAsync(NodeVariation.Kip);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNodeVariationAsync(NodeVariation.Kip);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setNodeVariationAsync(NodeVariation.Kip);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setNodesAsync", function() {
                it("should send a set group information request with changed node variation", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNodesAsync([0, 4]);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setNodesAsync([0, 4]);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setNodesAsync([0, 4]);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setTargetPositionRawAsync", function() {
                it("should send a set group information request with changed node variation", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setTargetPositionRawAsync(0xC000);

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x01, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    // Mock request
                    conn.valueToReturn.push(dataCfm);

                    const result = group.setTargetPositionRawAsync(0xC000);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setTargetPositionRawAsync(0xC000);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

            describe("setTargetPositionAsync", function() {
                it("should send a set group information request with changed node variation", async function() {
                    const data = Buffer.from([0x05, 0x02, 0x23, 0x00, 51]);
                    const dataCfm = new GW_SET_GROUP_INFORMATION_CFM(data);

                    const dataGetNodeInfo = Buffer.from([0x05, 0x02, 0x01, 0x00, 51]);
                    const dataGetNodeInfoCfm = new GW_GET_NODE_INFORMATION_CFM(dataGetNodeInfo);

                    const dataNodeInfo = Buffer.from([127, 0x02, 0x10, 
                        // Node ID
                        0,
                        // Order
                        0x00, 0x02,
                        // Placement
                        3,
                        // Name
                        0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                        // Velocity
                        0,  // DEFAULT
                        // Node Type / Sub type
                        0x01, 0x01,
                        // Product Type
                        0, 41,
                        // Node Variation
                        2,  // KIP
                        // Power Mode
                        0,
                        // Serial number
                        1, 2, 3, 4, 5, 6, 7, 8,
                        // ???
                        0,
                        // State
                        4,  // Executing
                        // Current Position
                        0xC0, 0x00,
                        // Target
                        0xC8, 0x00,
                        // FP1 Current Position
                        0xF7, 0xFF,
                        // FP2 Current Position
                        0xF7, 0xFF,
                        // FP3 Current Position
                        0xF7, 0xFF,
                        // FP4 Current Position
                        0xF7, 0xFF,
                        // Remaining Time
                        0, 5,
                        // Time stamp
                        0x00, 0xF9, 0x39, 0x90,
                        // # of aliases
                        1,
                        // Aliases array
                        0xD8, 0x03, 0xC4, 0x00,
                        0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x00, 0x00
                    ]);
                    const dataNodeInfoNtf = new GW_GET_NODE_INFORMATION_NTF(dataNodeInfo);

                    // Mock request
                    conn.valueToReturn.push(dataGetNodeInfoCfm);

                    const result = group.setTargetPositionAsync(0.5);

                    // Send notification
                    conn.sendNotification(dataNodeInfoNtf, [dataCfm]);

                    // Just let the asynchronous stuff run before our checks
                    await new Promise(resolve => { setTimeout(resolve, 0); });

                    return expect(result).to.be.fulfilled;
                });

                it("should reject on error status", async function() {
                    const dataGetNodeInfo = Buffer.from([0x05, 0x02, 0x01, 0x01, 51]);
                    const dataGetNodeInfoCfm = new GW_GET_NODE_INFORMATION_CFM(dataGetNodeInfo);

                    // Mock request
                    conn.valueToReturn.push(dataGetNodeInfoCfm);

                    const result = group.setTargetPositionAsync(0.5);

                    return expect(result).to.be.rejectedWith(Error);
                });

                it("should reject on error frame", async function() {
                    // Mock request
                    conn.valueToReturn.push(dataErrorNtf);

                    const result = group.setTargetPositionAsync(0.5);

                    return expect(result).to.be.rejectedWith(Error);
                });
            });

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
        });
    });
});
