import { Component } from "./utils/PropertyChangedEvent";
import { IConnection } from "./connection";
import { GW_GET_GROUP_INFORMATION_NTF } from "./KLF200-API/GW_GET_GROUP_INFORMATION_NTF";
import { GW_GET_ALL_GROUPS_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_NTF";
import { Velocity, NodeVariation } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GroupType } from "./KLF200-API/GW_GROUPS";
import { Listener, Disposable } from "./utils/TypedEvent";
import { GW_GROUP_INFORMATION_CHANGED_NTF_Modified } from "./KLF200-API/GW_GROUP_INFORMATION_CHANGED_NTF";
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
export declare class Group extends Component {
    readonly Connection: IConnection;
    /**
     * ID of the group.
     *
     * @type {number}
     * @memberof Group
     */
    readonly GroupID: number;
    private _order;
    private _placement;
    private _name;
    private _velocity;
    private _nodeVariation;
    private _groupType;
    /**
     * List of node IDs which are part of the group.
     *
     * @type {number[]}
     * @memberof Group
     */
    readonly Nodes: number[];
    private _revision;
    /**
     * Creates an instance of Group.
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @param {(GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF)} frame Notification frame that is used to set the properties of the Group class instance.
     * @memberof Group
     */
    constructor(Connection: IConnection, frame: GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF_Modified);
    changeFromNotification(frame: GW_GROUP_INFORMATION_CHANGED_NTF_Modified): void;
    /**
     * The order in which the groups should be displayed by a client application.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    readonly Order: number;
    /**
     * The placement of the product. Either a house index or a room index number.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    readonly Placement: number;
    /**
     * Name of the group.
     *
     * @readonly
     * @type {string}
     * @memberof Group
     */
    readonly Name: string;
    /**
     * The velocity at which the products of the group are operated at if possible.
     *
     * @readonly
     * @type {Velocity}
     * @memberof Group
     */
    readonly Velocity: Velocity;
    /**
     * Defines the variation of the group.
     *
     * @readonly
     * @type {NodeVariation}
     * @memberof Group
     */
    readonly NodeVariation: NodeVariation;
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
    readonly GroupType: GroupType;
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
    changeGroupAsync(order: number, placement: number, name: string, velocity: Velocity, nodeVariation: NodeVariation, nodes: number[]): Promise<void>;
    /**
     * Sets a new value for the order number of the group.
     *
     * @param {number} newOrder New value for the order property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setOrderAsync(newOrder: number): Promise<void>;
    /**
     * Sets a new value for the placement of the group.
     *
     * @param {number} newPlacement New value for the placement property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setPlacementAsync(newPlacement: number): Promise<void>;
    /**
     * Renames the group.
     *
     * @param {string} newName New name of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNameAsync(newName: string): Promise<void>;
    /**
     * Sets the velocity for the group.
     *
     * @param {Velocity} newVelocity New velocity value for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setVelocityAsync(newVelocity: Velocity): Promise<void>;
    /**
     * Sets the variation of the group to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void>;
    /**
     * Sets the group to contain the provided list of node IDs in the group.
     *
     * @param {number[]} newNodes Array of new node IDs for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    setNodes(newNodes: number[]): Promise<void>;
    /**
     * Sets the target position for all products of the group as raw value.
     *
     * @param {number} newPositionRaw New target position value as raw value.
     * @returns {Promise<number>}
     * @memberof Group
     */
    setTargetPositionAsyncRaw(newPositionRaw: number): Promise<number>;
    /**
     * Sets the target position for all products of the group
     *
     * @param {number} newPosition New target position value in percent.
     * @returns {Promise<number>}
     * @memberof Group
     */
    setTargetPositionAsync(newPosition: number): Promise<number>;
}
export declare class Groups {
    readonly Connection: IConnection;
    private _onChangedGroup;
    private _onRemovedGroup;
    /**
     * Contains a list of groups.
     * The index of each group corresponds to the
     * group ID.
     *
     * @type {Group[]}
     * @memberof Groups
     */
    readonly Groups: Group[];
    private constructor();
    private initializeGroupsAsync;
    /**
     * Adds a handler that will be called if a new group is added to the KLF-200 interface or a group has been changed.
     *
     * @param {Listener<number>} handler Event handler that is called if a new group is added or a group has been changed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    onChangedGroup(handler: Listener<number>): Disposable;
    /**
     * Adds a handler that will be called if a group is removed from the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a group is removed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    onRemovedGroupd(handler: Listener<number>): Disposable;
    private notifyChangedGroup;
    private notifyRemovedGroup;
    private onNotificationHandler;
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
    static createGroupsAsync(Connection: IConnection): Promise<Groups>;
    /**
     * Finds a group by its name and returns the group object.
     *
     * @param {string} groupName The name of the group.
     * @returns {(Group | undefined)} Returns the group object if found, otherwise undefined.
     * @memberof Groups
     */
    findByName(groupName: string): Group | undefined;
}
