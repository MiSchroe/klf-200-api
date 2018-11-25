"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PropertyChangedEvent_1 = require("./utils/PropertyChangedEvent");
const GW_GET_GROUP_INFORMATION_NTF_1 = require("./KLF200-API/GW_GET_GROUP_INFORMATION_NTF");
const GW_GET_ALL_GROUPS_INFORMATION_NTF_1 = require("./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_NTF");
const UtilityFunctions_1 = require("./utils/UtilityFunctions");
const GW_SET_GROUP_INFORMATION_REQ_1 = require("./KLF200-API/GW_SET_GROUP_INFORMATION_REQ");
const common_1 = require("./KLF200-API/common");
const TypedEvent_1 = require("./utils/TypedEvent");
const GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF_1 = require("./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF");
const GW_GET_ALL_GROUPS_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_REQ");
const GW_GROUP_INFORMATION_CHANGED_NTF_1 = require("./KLF200-API/GW_GROUP_INFORMATION_CHANGED_NTF");
const GW_ACTIVATE_PRODUCTGROUP_REQ_1 = require("./KLF200-API/GW_ACTIVATE_PRODUCTGROUP_REQ");
const GW_COMMAND_1 = require("./KLF200-API/GW_COMMAND");
const GW_GET_NODE_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_NODE_INFORMATION_REQ");
const GW_GET_NODE_INFORMATION_NTF_1 = require("./KLF200-API/GW_GET_NODE_INFORMATION_NTF");
'use strict';
/**
 * The gateway can hold up to 100 groups. A group is a collection of actuator nodes in
conjunction with a name and some other come characteristics.

There are three different group types. House, Room and User defined. There can be only
one instance of the group type house. The GroupID = 0 is reserved for the house group.
An actuator can only be represented in one room group. So, if an actuator is assigned to
a room group is will automatically be removed from another existing room group.
 *
 * @export
 * @class Group
 * @extends {Component}
 */
class Group extends PropertyChangedEvent_1.Component {
    /**
     * Creates an instance of Group.
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @param {(GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF)} frame Notification frame that is used to set the properties of the Group class instance.
     * @memberof Group
     */
    constructor(Connection, frame) {
        super();
        this.Connection = Connection;
        /**
         * List of node IDs which are part of the group.
         *
         * @type {number[]}
         * @memberof Group
         */
        this.Nodes = [];
        this.GroupID = frame.GroupID;
        this._order = frame.Order;
        this._placement = frame.Placement;
        this._name = frame.Name;
        this._velocity = frame.Velocity;
        this._nodeVariation = frame.NodeVariation;
        this._groupType = frame.GroupType;
        this.Nodes.push(...frame.Nodes);
        this._revision = frame.Revision;
    }
    changeFromNotifidation(frame) {
        if (this._order !== frame.Order) {
            this._order = frame.Order;
            this.propertyChanged("Order");
        }
        if (this._placement !== frame.Placement) {
            this._placement = frame.Placement;
            this.propertyChanged("Placement");
        }
        if (this._name !== frame.Name) {
            this._name = frame.Name;
            this.propertyChanged("Name");
        }
        if (this._velocity !== frame.Velocity) {
            this._velocity = frame.Velocity;
            this.propertyChanged("Velocity");
        }
        if (this._nodeVariation !== frame.NodeVariation) {
            this._nodeVariation = frame.NodeVariation;
            this.propertyChanged("NodeVariation");
        }
        if (this._groupType !== frame.GroupType) {
            this._groupType = frame.GroupType;
            this.propertyChanged("GroupType");
        }
        if (!UtilityFunctions_1.isArrayEqual(this.Nodes, frame.Nodes)) {
            this.Nodes.length = 0; // Clear nodes array
            this.Nodes.push(...frame.Nodes);
            this.propertyChanged("Nodes");
        }
        this._revision = frame.Revision;
    }
    /**
     * The order in which the groups should be displayed by a client application.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    get Order() { return this._order; }
    /**
     * The placement of the product. Either a house index or a room index number.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    get Placement() { return this._placement; }
    /**
     * Name of the group.
     *
     * @readonly
     * @type {string}
     * @memberof Group
     */
    get Name() { return this._name; }
    /**
     * The velocity at which the products of the group are operated at if possible.
     *
     * @readonly
     * @type {Velocity}
     * @memberof Group
     */
    get Velocity() { return this._velocity; }
    /**
     * Defines the variation of the group.
     *
     * @readonly
     * @type {NodeVariation}
     * @memberof Group
     */
    get NodeVariation() { return this._nodeVariation; }
    /**
     * Type of the group.
     *
     * * House - The house group can't be changed and contains all node IDs.
     * * Room - Each product can only be in one room.
     * * User group - User groups can be defined freely.
     *
     * @readonly
     * @type {GroupType}
     * @memberof Group
     */
    get GroupType() { return this._groupType; }
    /**
     * Change properties of the group.
     *
     * If there are no changes in the properties the method returns directly with a resolved promise.
     *
     * @param {number} order New value for the Order property.
     * @param {number} placement New value for the Placement property.
     * @param {string} name New value for the Name property.
     * @param {Velocity} velocity New value for the Velocity property.
     * @param {NodeVariation} nodeVariation New value for the NodeVariation property.
     * @param {number[]} nodes New list of nodes.
     * @returns {Promise<void>}
     * @memberof Group
     */
    changeGroupAsync(order, placement, name, velocity, nodeVariation, nodes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const changedProperties = [];
                if (order !== this._order)
                    changedProperties.push("Order");
                if (placement !== this._placement)
                    changedProperties.push("Placement");
                if (name !== this._name)
                    changedProperties.push("Name");
                if (velocity !== this._velocity)
                    changedProperties.push("Velocity");
                if (nodeVariation !== this._nodeVariation)
                    changedProperties.push("NodeVariation");
                if (!UtilityFunctions_1.isArrayEqual(nodes, this.Nodes))
                    changedProperties.push("Nodes");
                // If there are no changes in the properties return directly with a resolved promise.
                if (changedProperties.length === 0)
                    return Promise.resolve();
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_GROUP_INFORMATION_REQ_1.GW_SET_GROUP_INFORMATION_REQ(this.GroupID, this._revision, name, this._groupType, nodes, order, placement, velocity, nodeVariation));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    changedProperties.forEach(propName => this.propertyChanged(propName));
                    return Promise.resolve();
                }
                else {
                    return Promise.reject(new Error(confirmationFrame.getError()));
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Sets a new value for the order number of the group.
     *
     * @param {number} newOrder New value for the order property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setOrderAsync(newOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(newOrder, this._placement, this._name, this._velocity, this._nodeVariation, this.Nodes);
        });
    }
    /**
     * Sets a new value for the placement of the group.
     *
     * @param {number} newPlacement New value for the placement property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setPlacementAsync(newPlacement) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(this._order, newPlacement, this._name, this._velocity, this._nodeVariation, this.Nodes);
        });
    }
    /**
     * Renames the group.
     *
     * @param {string} newName New name of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNameAsync(newName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(this._order, this._placement, newName, this._velocity, this._nodeVariation, this.Nodes);
        });
    }
    /**
     * Sets the velocity for the group.
     *
     * @param {Velocity} newVelocity New velocity value for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setVelocityAsync(newVelocity) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(this._order, this._placement, this._name, newVelocity, this._nodeVariation, this.Nodes);
        });
    }
    /**
     * Sets the variation of the group to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNodeVariationAsync(newNodeVariation) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(this._order, this._placement, this._name, this._velocity, newNodeVariation, this.Nodes);
        });
    }
    /**
     * Sets the group to contain the provided list of node IDs in the group.
     *
     * @param {number[]} newNodes Array of new node IDs for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNodes(newNodes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.changeGroupAsync(this._order, this._placement, this._name, this._velocity, this._nodeVariation, newNodes);
        });
    }
    /**
     * Sets the target position for all products of the group as raw value.
     *
     * @param {number} newPositionRaw New target position value as raw value.
     * @returns {Promise<number>}
     * @memberof Group
     */
    setTargetPositionAsyncRaw(newPositionRaw) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_ACTIVATE_PRODUCTGROUP_REQ_1.GW_ACTIVATE_PRODUCTGROUP_REQ(this.GroupID, newPositionRaw));
                if (confirmationFrame.Status === GW_COMMAND_1.ActivateProductGroupStatus.OK) {
                    return confirmationFrame.SessionID;
                }
                else {
                    return Promise.reject(new Error(confirmationFrame.getError()));
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Sets the target position for all products of the group
     *
     * @param {number} newPosition New target position value in percent.
     * @returns {Promise<number>}
     * @memberof Group
     */
    setTargetPositionAsync(newPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get product type from first node ID for conversion
                const nodeID = this.Nodes[0];
                const nodeTypeID = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_NODE_INFORMATION_NTF_1.GW_GET_NODE_INFORMATION_NTF && frame.NodeID === nodeID) {
                            dispose.dispose();
                            resolve(frame.ActuatorType);
                        }
                    }, [common_1.GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                    const productInformation = yield this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ_1.GW_GET_NODE_INFORMATION_REQ(nodeID));
                    if (productInformation.Status !== common_1.GW_COMMON_STATUS.SUCCESS) {
                        dispose.dispose();
                        reject(new Error(productInformation.getError()));
                    }
                }));
                return this.setTargetPositionAsyncRaw(GW_COMMAND_1.convertPosition(newPosition, nodeTypeID));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.Group = Group;
class Groups {
    constructor(Connection) {
        this.Connection = Connection;
        this._onChangedGroup = new TypedEvent_1.TypedEvent();
        this._onRemovedGroup = new TypedEvent_1.TypedEvent();
        /**
         * Contains a list of groups.
         * The index of each group corresponds to the
         * group ID.
         *
         * @type {Group[]}
         * @memberof Groups
         */
        this.Groups = [];
    }
    initializeGroupsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const dispose = this.Connection.on(frame => {
                            if (frame instanceof GW_GET_ALL_GROUPS_INFORMATION_NTF_1.GW_GET_ALL_GROUPS_INFORMATION_NTF || frame instanceof GW_GET_GROUP_INFORMATION_NTF_1.GW_GET_GROUP_INFORMATION_NTF) {
                                this.Groups[frame.GroupID] = new Group(this.Connection, frame);
                            }
                            else if (frame instanceof GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF_1.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF) {
                                dispose.dispose();
                                this.Connection.on(this.onNotificationHandler, [common_1.GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF]);
                                resolve();
                            }
                        }, [common_1.GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF, common_1.GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, common_1.GatewayCommand.GW_GET_GROUP_INFORMATION_NTF]);
                        yield this.Connection.sendFrameAsync(new GW_GET_ALL_GROUPS_INFORMATION_REQ_1.GW_GET_ALL_GROUPS_INFORMATION_REQ());
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Adds a handler that will be called if a new group is added to the KLF-200 interface or a group has been changed.
     *
     * @param {Listener<number>} handler Event handler that is called if a new group is added or a group has been changed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    onChangedGroup(handler) {
        return this._onChangedGroup.on(handler);
    }
    /**
     * Adds a handler that will be called if a group is removed from the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a group is removed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    onRemovedGroupd(handler) {
        return this._onRemovedGroup.on(handler);
    }
    notifyChangedGroup(groupId) {
        this._onChangedGroup.emit(groupId);
    }
    notifyRemovedGroup(groupId) {
        this._onRemovedGroup.emit(groupId);
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_GROUP_INFORMATION_CHANGED_NTF_1.GW_GROUP_INFORMATION_CHANGED_NTF) {
            switch (frame.ChangeType) {
                case GW_GROUP_INFORMATION_CHANGED_NTF_1.ChangeType.Deleted:
                    // Remove group
                    delete this.Groups[frame.GroupID];
                    this.notifyRemovedGroup(frame.GroupID);
                    break;
                case GW_GROUP_INFORMATION_CHANGED_NTF_1.ChangeType.Modified:
                    // Add or change group
                    if (typeof this.Groups[frame.GroupID] === "undefined") {
                        // Add node
                        this.Groups[frame.GroupID] = new Group(this.Connection, frame);
                    }
                    else {
                        // Change group
                        this.Groups[frame.GroupID].changeFromNotifidation(frame);
                    }
                    this.notifyChangedGroup(frame.GroupID);
                default:
                    break;
            }
        }
    }
    /**
     * Creates a new instance of the Groups class.
     * During the initialization phase of the class
     * a list of all groups will be retrieved from
     * the KLF-200 interface and stored at the
     * Groups array.
     *
     * Additionally, some notification handlers
     * will be instantiated to watch for changes
     * to the groups.
     *
     * @static
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @returns {Promise<Groups>} Resolves to a new instance of the Groups class.
     * @memberof Groups
     */
    static createGroupsAsync(Connection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = new Groups(Connection);
                yield result.initializeGroupsAsync();
                return result;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Finds a group by its name and returns the group object.
     *
     * @param {string} groupName The name of the group.
     * @returns {(Group | undefined)} Returns the group object if found, otherwise undefined.
     * @memberof Groups
     */
    findByName(groupName) {
        return this.Groups.find(grp => typeof grp !== "undefined" && grp.Name === groupName);
    }
}
exports.Groups = Groups;
//# sourceMappingURL=groups.js.map