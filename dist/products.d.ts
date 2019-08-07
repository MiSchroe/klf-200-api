/// <reference types="node" />
import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF";
import { GW_GET_ALL_NODES_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_NTF";
import { IConnection } from "./connection";
import { Listener, Disposable } from "./utils/TypedEvent";
import { Component } from "./utils/PropertyChangedEvent";
import { RunStatus, StatusReply } from "./KLF200-API/GW_COMMAND";
/**
 * Each product that is registered at the KLF-200 interface will be created
 * as an instance of the Product class.
 *
 * @export
 * @class Product
 */
export declare class Product extends Component {
    readonly Connection: IConnection;
    private _name;
    /**
     * NodeID is an Actuator index in the system table, to get information from. It must be a
     * value from 0 to 199.
     *
     * @type {number}
     * @memberof Product
     */
    readonly NodeID: number;
    /**
     * Indicates the node type, ex. Window, Roller shutter, Light etc.
     *
     * @type {ActuatorType}
     * @memberof Product
     */
    readonly TypeID: ActuatorType;
    /**
     * Details the node type and depends on the TypeID property.
     *
     * @type {number}
     * @memberof Product
     */
    readonly SubType: number;
    private _order;
    private _placement;
    /**
     * Velocity the node is operated with.
     *
     * @type {Velocity}
     * @memberof Product
     */
    readonly Velocity: Velocity;
    private _nodeVariation;
    /**
     * The power mode of the node.
     *
     * @type {PowerSaveMode}
     * @memberof Product
     */
    readonly PowerSaveMode: PowerSaveMode;
    /**
     * The serial number of the product.
     *
     * @type {Buffer}
     * @memberof Product
     */
    readonly SerialNumber: Buffer;
    /**
     * Type of the product, eg. KMG, KMX.
     *
     * @type {number}
     * @memberof Product
     */
    readonly ProductType: number;
    private _state;
    private _currentPositionRaw;
    private _targetPositionRaw;
    private _fp1CurrentPositionRaw;
    private _fp2CurrentPositionRaw;
    private _fp3CurrentPositionRaw;
    private _fp4CurrentPositionRaw;
    private _remainingTime;
    private _timeStamp;
    /**
     * Contains the position values to move the product to a special position.
     * The special position is defined by the alias value.
     *
     * E.g. for a window the alias ID for secured ventilation if 0xD803.
     * To move a product into secured ventilation position you have to read
     * the value of the alias for the alias ID 0xD803 and set the
     * raw target position to that value.
     *
     * @type {ActuatorAlias[]}
     * @memberof Product
     */
    readonly ProductAlias: ActuatorAlias[];
    private _runStatus;
    private _statusReply;
    /**
     *Creates an instance of Product.
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @param {(GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF)} frame Notification frame that is used to set the properties of the Product class instance.
     * @memberof Product
     */
    constructor(Connection: IConnection, frame: GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF);
    /**
     * Name of the product.
     *
     * @readonly
     * @type {string}
     * @memberof Product
     */
    readonly Name: string;
    /**
     * Renames the product.
     *
     * @param {string} newName New name of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setNameAsync(newName: string): Promise<void>;
    /**
     * String representation of the TypeID and SubType.
     *
     * @readonly
     * @type {string}
     * @memberof Product
     */
    readonly Category: string;
    /**
     * Defines the variation of a product.
     *
     * @readonly
     * @type {NodeVariation}
     * @memberof Product
     */
    readonly NodeVariation: NodeVariation;
    /**
     * Sets the variation of a product to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void>;
    /**
     * Sets the order and placement of the product.
     *
     * @param {number} newOrder The new order value of the product.
     * @param {number} newPlacement The new placement value of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setOrderAndPlacementAsync(newOrder: number, newPlacement: number): Promise<void>;
    /**
     * The order in which the products should be displayed by a client application.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly Order: number;
    /**
     * Sets a new value for the order number of the product.
     *
     * @param {number} newOrder New value for the order property.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setOrderAsync(newOrder: number): Promise<void>;
    /**
     * The placement of the product. Either a house index or a room index number.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly Placement: number;
    /**
     * Sets a new value for the placement of the product.
     *
     * @param {number} newPlacement New value for the placement property.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setPlacementAsync(newPlacement: number): Promise<void>;
    /**
     * Current operating state of the product.
     *
     * @readonly
     * @type {NodeOperatingState}
     * @memberof Product
     */
    readonly State: NodeOperatingState;
    /**
     * Raw value of the current position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly CurrentPositionRaw: number;
    /**
     * Raw value of the target value for the position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly TargetPositionRaw: number;
    /**
     * Raw value of the current position of the functional paramter 1.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly FP1CurrentPositionRaw: number;
    /**
     * Raw value of the current position of the functional paramter 2.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly FP2CurrentPositionRaw: number;
    /**
     * Raw value of the current position of the functional paramter 3.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly FP3CurrentPositionRaw: number;
    /**
     * Raw value of the current position of the functional paramter 4.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly FP4CurrentPositionRaw: number;
    /**
     * Remaining time in seconds to reach the desired target position.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly RemainingTime: number;
    /**
     * Timestamp of the last change to any of the properties.
     *
     * @readonly
     * @type {Date}
     * @memberof Product
     */
    readonly TimeStamp: Date;
    /**
     * The current run status of the product.
     *
     * @readonly
     * @type {RunStatus}
     * @memberof Product
     */
    readonly RunStatus: RunStatus;
    /**
     * Additional status information, e.g. that opening a window is overruled by the rain sensor.
     *
     * @readonly
     * @type {StatusReply}
     * @memberof Product
     */
    readonly StatusReply: StatusReply;
    /**
     * The current position of the product in percent.
     *
     * The value is derived from the raw value and depending on
     * the type ID it is inverted, so that 100% means e.g.
     * window is fully open, roller shutter is fully closed,
     * light is at full power etc.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly CurrentPosition: number;
    /**
     * Sets the product to a new position in percent.
     *
     * @param {number} newPosition New position value in percent.
     * @returns {Promise<number>}
     * @memberof Product
     */
    setTargetPositionAsync(newPosition: number): Promise<number>;
    /**
     * The target position in percent.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    readonly TargetPosition: number;
    /**
     * Stops the product at the current position.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    stopAsync(): Promise<number>;
    /**
     * Let the product "wink". Its main intention is to identify a product.
     *
     * Winking depends on the product, e.g. a window moves the handle
     * a little bit.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    winkAsync(): Promise<number>;
    private onNotificationHandler;
    private onNodeInformationChanged;
    private onNodeStatePositionChanged;
    private onRunStatus;
    private onRemainingTime;
}
/**
 * Use the products object to retrieve a list of products known to your KLF interface.
 * Products are e.g. windows, roller shutters, awnings.
 *
 * To create an instance of the Products class use the
 * static method [Products.createProductsAsync]{@link Products#createProductsAsync}.
 *
 * @export
 * @class Products
 */
export declare class Products {
    readonly Connection: IConnection;
    private _onNewProduct;
    private _onRemovedProduct;
    /**
     * Contains a list of products.
     * The index of each product corresponds to the
     * system table index. The range is [0-199].
     *
     * @type {Product[]}
     * @memberof Products
     */
    readonly Products: Product[];
    /**
     *Creates an instance of Products.
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @memberof Products
     */
    private constructor();
    private initializeProductsAsync;
    /**
     * Adds a handler that will be called if a new product is added to the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a new product is added.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Products
     */
    onNewProduct(handler: Listener<number>): Disposable;
    /**
     * Adds a handler that will be called if a product is removed from the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a product is removed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Products
     */
    onRemovedProduct(handler: Listener<number>): Disposable;
    private notifyNewProduct;
    private notifiyRemovedProduct;
    private onNotificationHandler;
    private addNodeAsync;
    /**
     * Creates a new instance of the Products class.
     * During the initialization phase of the class
     * a list of all registered products will be
     * retrieved from the KFL-200 interface and
     * stored at the Product array.
     *
     * Additionally, some notification handlers
     * will be instantiated to watch for changes
     * to the products.
     *
     * @static
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @returns {Promise<Products>} Resolves to a new instance of the Products class.
     * @memberof Products
     */
    static createProductsAsync(Connection: IConnection): Promise<Products>;
    findByName(productName: string): Product | undefined;
}
