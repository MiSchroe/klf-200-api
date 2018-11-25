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
const GW_SYSTEMTABLE_DATA_1 = require("./KLF200-API/GW_SYSTEMTABLE_DATA");
const GW_GET_ALL_NODES_INFORMATION_NTF_1 = require("./KLF200-API/GW_GET_ALL_NODES_INFORMATION_NTF");
const GW_SET_NODE_NAME_REQ_1 = require("./KLF200-API/GW_SET_NODE_NAME_REQ");
const common_1 = require("./KLF200-API/common");
const GW_SET_NODE_VARIATION_REQ_1 = require("./KLF200-API/GW_SET_NODE_VARIATION_REQ");
const GW_SET_NODE_ORDER_AND_PLACEMENT_REQ_1 = require("./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_REQ");
const TypedEvent_1 = require("./utils/TypedEvent");
const PropertyChangedEvent_1 = require("./utils/PropertyChangedEvent");
const GW_NODE_INFORMATION_CHANGED_NTF_1 = require("./KLF200-API/GW_NODE_INFORMATION_CHANGED_NTF");
const GW_NODE_STATE_POSITION_CHANGED_NTF_1 = require("./KLF200-API/GW_NODE_STATE_POSITION_CHANGED_NTF");
const GW_COMMAND_SEND_REQ_1 = require("./KLF200-API/GW_COMMAND_SEND_REQ");
const GW_GET_ALL_NODES_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_ALL_NODES_INFORMATION_REQ");
const GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF_1 = require("./KLF200-API/GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF");
const GW_CS_SYSTEM_TABLE_UPDATE_NTF_1 = require("./KLF200-API/GW_CS_SYSTEM_TABLE_UPDATE_NTF");
const GW_GET_NODE_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_NODE_INFORMATION_REQ");
const GW_WINK_SEND_REQ_1 = require("./KLF200-API/GW_WINK_SEND_REQ");
const GW_COMMAND_1 = require("./KLF200-API/GW_COMMAND");
const GW_COMMAND_RUN_STATUS_NTF_1 = require("./KLF200-API/GW_COMMAND_RUN_STATUS_NTF");
const GW_COMMAND_REMAINING_TIME_NTF_1 = require("./KLF200-API/GW_COMMAND_REMAINING_TIME_NTF");
'use strict';
/**
 * Each product that is registered at the KLF-200 interface will be created
 * as an instance of the Product class.
 *
 * @export
 * @class Product
 */
class Product extends PropertyChangedEvent_1.Component {
    /**
     *Creates an instance of Product.
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @param {(GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF)} frame Notification frame that is used to set the properties of the Product class instance.
     * @memberof Product
     */
    constructor(Connection, frame) {
        super();
        this.Connection = Connection;
        this._runStatus = GW_COMMAND_1.RunStatus.ExecutionCompleted;
        this._statusReply = GW_COMMAND_1.StatusReply.Unknown;
        this.NodeID = frame.NodeID;
        this._name = frame.Name;
        this.TypeID = frame.ActuatorType;
        this.SubType = frame.ActuatorSubType;
        this._order = frame.Order;
        this._placement = frame.Placement;
        this.Velocity = frame.Velocity;
        this._nodeVariation = frame.NodeVariation;
        this.PowerSaveMode = frame.PowerSaveMode;
        this.SerialNumber = frame.SerialNumber;
        this.ProductType = frame.ProductType;
        this._state = frame.OperatingState;
        this._currentPositionRaw = frame.CurrentPosition;
        this._targetPositionRaw = frame.TargetPosition;
        this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
        this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
        this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
        this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
        this._remainingTime = frame.RemainingTime;
        this._timeStamp = frame.TimeStamp;
        this.ProductAlias = frame.ActuatorAliases;
        this.Connection.on(frame => this.onNotificationHandler(frame), [
            common_1.GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
            common_1.GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
            common_1.GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
            common_1.GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF
        ]);
    }
    /**
     * Name of the product.
     *
     * @readonly
     * @type {string}
     * @memberof Product
     */
    get Name() { return this._name; }
    /**
     * Renames the product.
     *
     * @param {string} newName New name of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setNameAsync(newName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_NODE_NAME_REQ_1.GW_SET_NODE_NAME_REQ(this.NodeID, newName));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    this._name = newName;
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
     * String representation of the TypeID and SubType.
     *
     * @readonly
     * @type {string}
     * @memberof Product
     */
    get Category() {
        switch (this.TypeID) {
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.VenetianBlind:
                return "Interior venetian blind";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.RollerShutter:
                switch (this.SubType) {
                    case 1:
                        return "Adjustable slats roller shutter";
                    case 2:
                        return "Roller shutter with projection";
                    default:
                        return "Roller shutter";
                }
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.Awning:
                return "Vertical exterior awning";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.WindowOpener:
                switch (this.SubType) {
                    case 1:
                        return "Window opener with integrated rain sensor";
                    default:
                        return "Window opener";
                }
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.GarageOpener:
                return "Garage door opener";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.Light:
                return "Light";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.GateOpener:
                return "Gate opener";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.Lock:
                switch (this.SubType) {
                    case 1:
                        return "Window lock";
                    default:
                        return "Door lock";
                }
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.Blind:
                return "Vertical interior blind";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.DualShutter:
                return "Dual roller shutter";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.OnOffSwitch:
                return "On/Off switch";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.HorizontalAwning:
                return "Horizontal awning";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.ExternalVentianBlind:
                return "Exterior venetion blind";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.LouvreBlind:
                return "Louvre blind";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.CurtainTrack:
                return "Curtain track";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.VentilationPoint:
                switch (this.SubType) {
                    case 1:
                        return "Air inlet";
                    case 2:
                        return "Air transfer";
                    case 3:
                        return "Air outlet";
                    default:
                        return "Ventilation point";
                }
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.ExteriorHeating:
                return "Exterior heating";
            case GW_SYSTEMTABLE_DATA_1.ActuatorType.SwingingShutter:
                switch (this.SubType) {
                    case 1:
                        return "Swinging shutter with independent handling of the leaes";
                    default:
                        return "Swinging shutter";
                }
            default:
                return `${this.TypeID.toString()}.${this.SubType.toString()}`;
        }
    }
    /**
     * Defines the variation of a product.
     *
     * @readonly
     * @type {NodeVariation}
     * @memberof Product
     */
    get NodeVariation() { return this._nodeVariation; }
    /**
     * Sets the variation of a product to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setNodeVariationAsync(newNodeVariation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_NODE_VARIATION_REQ_1.GW_SET_NODE_VARIATION_REQ(this.NodeID, newNodeVariation));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    this._nodeVariation = newNodeVariation;
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
     * Sets the order and placement of the product.
     *
     * @param {number} newOrder The new order value of the product.
     * @param {number} newPlacement The new placement value of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setOrderAndPlacementAsync(newOrder, newPlacement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ_1.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(this.NodeID, newOrder, newPlacement));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    this._order = newOrder;
                    this._placement = newPlacement;
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
     * The order in which the products should be displayed by a client application.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get Order() { return this._order; }
    /**
     * Sets a new value for the order number of the product.
     *
     * @param {number} newOrder New value for the order property.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setOrderAsync(newOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setOrderAndPlacementAsync(newOrder, this._placement);
        });
    }
    /**
     * The placement of the product. Either a house index or a room index number.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get Placement() { return this._placement; }
    /**
     * Sets a new value for the placement of the product.
     *
     * @param {number} newPlacement New value for the placement property.
     * @returns {Promise<void>}
     * @memberof Product
     */
    setPlacementAsync(newPlacement) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setOrderAndPlacementAsync(this._order, newPlacement);
        });
    }
    /**
     * Current operating state of the product.
     *
     * @readonly
     * @type {NodeOperatingState}
     * @memberof Product
     */
    get State() { return this._state; }
    /**
     * Raw value of the current position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get CurrentPositionRaw() { return this._currentPositionRaw; }
    /**
     * Raw value of the target value for the position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get TargetPositionRaw() { return this._targetPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 1.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get FP1CurrentPositionRaw() { return this._fp1CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 2.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get FP2CurrentPositionRaw() { return this._fp2CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 3.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get FP3CurrentPositionRaw() { return this._fp3CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 4.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get FP4CurrentPositionRaw() { return this._fp4CurrentPositionRaw; }
    /**
     * Remaining time in seconds to reach the desired target position.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get RemainingTime() { return this._remainingTime; }
    /**
     * Timestamp of the last change to any of the properties.
     *
     * @readonly
     * @type {Date}
     * @memberof Product
     */
    get TimeStamp() { return this._timeStamp; }
    /**
     * The current run status of the product.
     *
     * @readonly
     * @type {RunStatus}
     * @memberof Product
     */
    get RunStatus() { return this._runStatus; }
    /**
     * Additional status information, e.g. that opening a window is overruled by the rain sensor.
     *
     * @readonly
     * @type {StatusReply}
     * @memberof Product
     */
    get StatusReply() { return this._statusReply; }
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
    get CurrentPosition() {
        return GW_COMMAND_1.convertPositionRaw(this._currentPositionRaw, this.TypeID);
    }
    /**
     * Sets the product to a new position in percent.
     *
     * @param {number} newPosition New position value in percent.
     * @returns {Promise<number>}
     * @memberof Product
     */
    setTargetPositionAsync(newPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const req = new GW_COMMAND_SEND_REQ_1.GW_COMMAND_SEND_REQ(this.NodeID, GW_COMMAND_1.convertPosition(newPosition, this.TypeID));
                // const dispose = this.connection.on(frame => {
                //     if (frame instanceof GW_SESSION_FINISHED_NTF && frame.SessionID === req.SessionID) {
                //         dispose.dispose();
                //     }
                // }, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
                const confirmationFrame = yield this.Connection.sendFrameAsync(req);
                if (confirmationFrame.CommandStatus === GW_COMMAND_1.CommandStatus.CommandAccepted) {
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
     * The target position in percent.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    get TargetPosition() {
        return GW_COMMAND_1.convertPositionRaw(this._targetPositionRaw, this.TypeID);
    }
    /**
     * Stops the product at the current position.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    stopAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_COMMAND_SEND_REQ_1.GW_COMMAND_SEND_REQ(this.NodeID, 0xD200));
                if (confirmationFrame.CommandStatus === GW_COMMAND_1.CommandStatus.CommandAccepted) {
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
     * Let the product "wink". Its main intention is to identify a product.
     *
     * Winking depends on the product, e.g. a window moves the handle
     * a little bit.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    winkAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_WINK_SEND_REQ_1.GW_WINK_SEND_REQ(this.NodeID));
                if (confirmationFrame.Status === common_1.GW_INVERSE_STATUS.SUCCESS) {
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
    onNotificationHandler(frame) {
        if (typeof this === "undefined")
            return;
        if (frame instanceof GW_NODE_INFORMATION_CHANGED_NTF_1.GW_NODE_INFORMATION_CHANGED_NTF) {
            this.onNodeInformationChanged(frame);
        }
        else if (frame instanceof GW_NODE_STATE_POSITION_CHANGED_NTF_1.GW_NODE_STATE_POSITION_CHANGED_NTF) {
            this.onNodeStatePositionChanged(frame);
        }
        else if (frame instanceof GW_COMMAND_RUN_STATUS_NTF_1.GW_COMMAND_RUN_STATUS_NTF) {
            this.onRunStatus(frame);
        }
        else if (frame instanceof GW_COMMAND_REMAINING_TIME_NTF_1.GW_COMMAND_REMAINING_TIME_NTF) {
            this.onRemainingTime(frame);
        }
    }
    onNodeInformationChanged(frame) {
        if (frame.NodeID === this.NodeID) {
            if (frame.Name !== this._name) {
                this._name = frame.Name;
                this.propertyChanged("Name");
            }
            if (frame.NodeVariation !== this._nodeVariation) {
                this._nodeVariation = frame.NodeVariation;
                this.propertyChanged("NodeVariation");
            }
            if (frame.Order !== this._order) {
                this._order = frame.Order;
                this.propertyChanged("Order");
            }
            if (frame.Placement !== this._placement) {
                this._placement = frame.Placement;
                this.propertyChanged("Placement");
            }
        }
    }
    onNodeStatePositionChanged(frame) {
        if (frame.NodeID === this.NodeID) {
            if (frame.OperatingState !== this._state) {
                this._state = frame.OperatingState;
                this.propertyChanged("State");
            }
            if (frame.CurrentPosition !== this._currentPositionRaw) {
                this._currentPositionRaw = frame.CurrentPosition;
                this.propertyChanged("CurrentPositionRaw");
                this.propertyChanged("CurrentPosition");
            }
            if (frame.TargetPosition !== this._targetPositionRaw) {
                this._targetPositionRaw = frame.TargetPosition;
                this.propertyChanged("TargetPositionRaw");
                this.propertyChanged("TargetPosition");
            }
            if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
                this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
                this.propertyChanged("FP1CurrentPositionRaw");
            }
            if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
                this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
                this.propertyChanged("FP2CurrentPositionRaw");
            }
            if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
                this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
                this.propertyChanged("FP3CurrentPositionRaw");
            }
            if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
                this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
                this.propertyChanged("FP4CurrentPositionRaw");
            }
            if (frame.RemainingTime !== this._remainingTime) {
                this._remainingTime = frame.RemainingTime;
                this.propertyChanged("RemainingTime");
            }
            if (frame.TimeStamp !== this._timeStamp) {
                this._timeStamp = frame.TimeStamp;
                this.propertyChanged("TimeStamp");
            }
        }
    }
    onRunStatus(frame) {
        if (frame.NodeID === this.NodeID) {
            switch (frame.NodeParameter) {
                case GW_COMMAND_1.ParameterActive.MP:
                    if (frame.ParameterValue !== this._currentPositionRaw) {
                        this._currentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("CurrentPositionRaw");
                        this.propertyChanged("CurrentPosition");
                    }
                    break;
                case GW_COMMAND_1.ParameterActive.FP1:
                    if (frame.ParameterValue !== this._fp1CurrentPositionRaw) {
                        this._fp1CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP1CurrentPositionRaw");
                    }
                    break;
                case GW_COMMAND_1.ParameterActive.FP2:
                    if (frame.ParameterValue !== this._fp2CurrentPositionRaw) {
                        this._fp2CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP2CurrentPositionRaw");
                    }
                    break;
                case GW_COMMAND_1.ParameterActive.FP3:
                    if (frame.ParameterValue !== this._fp3CurrentPositionRaw) {
                        this._fp3CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP3CurrentPositionRaw");
                    }
                    break;
                case GW_COMMAND_1.ParameterActive.FP4:
                    if (frame.ParameterValue !== this._fp4CurrentPositionRaw) {
                        this._fp4CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP4CurrentPositionRaw");
                    }
                    break;
                default:
                    break;
            }
            if (frame.RunStatus !== this._runStatus) {
                this._runStatus = frame.RunStatus;
                this.propertyChanged("RunStatus");
            }
            if (frame.StatusReply !== this._statusReply) {
                this._statusReply = frame.StatusReply;
                this.propertyChanged("StatusReply");
            }
        }
    }
    onRemainingTime(frame) {
        if (frame.NodeID === this.NodeID && frame.NodeParameter === GW_COMMAND_1.ParameterActive.MP && frame.RemainingTime !== this._remainingTime) {
            this._remainingTime = frame.RemainingTime;
            this.propertyChanged("RemainingTime");
        }
    }
}
exports.Product = Product;
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
class Products {
    /**
     *Creates an instance of Products.
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @memberof Products
     */
    constructor(Connection) {
        this.Connection = Connection;
        this._onNewProduct = new TypedEvent_1.TypedEvent();
        this._onRemovedProduct = new TypedEvent_1.TypedEvent();
        /**
         * Contains a list of products.
         * The index of each product corresponds to the
         * system table index. The range is [0-199].
         *
         * @type {Product[]}
         * @memberof Products
         */
        this.Products = [];
    }
    initializeProductsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const dispose = this.Connection.on(frame => {
                            if (frame instanceof GW_GET_ALL_NODES_INFORMATION_NTF_1.GW_GET_ALL_NODES_INFORMATION_NTF) {
                                this.Products[frame.NodeID] = new Product(this.Connection, frame);
                            }
                            else if (frame instanceof GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF_1.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF) {
                                dispose.dispose();
                                this.Connection.on(this.onNotificationHandler, [common_1.GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF]);
                                resolve();
                            }
                        }, [common_1.GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF, common_1.GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF]);
                        yield this.Connection.sendFrameAsync(new GW_GET_ALL_NODES_INFORMATION_REQ_1.GW_GET_ALL_NODES_INFORMATION_REQ());
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
     * Adds a handler that will be called if a new product is added to the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a new product is added.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Products
     */
    onNewProduct(handler) {
        return this._onNewProduct.on(handler);
    }
    /**
     * Adds a handler that will be called if a product is removed from the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a product is removed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Products
     */
    onRemovedProduct(handler) {
        return this._onRemovedProduct.on(handler);
    }
    notifyNewProduct(nodeId) {
        this._onNewProduct.emit(nodeId);
    }
    notifiyRemovedProduct(nodeId) {
        this._onRemovedProduct.emit(nodeId);
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_CS_SYSTEM_TABLE_UPDATE_NTF_1.GW_CS_SYSTEM_TABLE_UPDATE_NTF) {
            // Remove nodes
            frame.RemovedNodes.forEach(nodeID => {
                delete this.Products[nodeID];
                this.notifiyRemovedProduct(nodeID);
            });
            // Add nodes
            frame.AddedNodes.forEach((nodeID) => __awaiter(this, void 0, void 0, function* () {
                this.Products[nodeID] = yield this.addNodeAsync(nodeID);
                this.notifyNewProduct(nodeID);
            }));
        }
    }
    addNodeAsync(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const dispose = this.Connection.on(frame => {
                            dispose.dispose();
                            resolve(new Product(this.Connection, frame));
                        }, [common_1.GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                        yield this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ_1.GW_GET_NODE_INFORMATION_REQ(nodeID));
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
    static createProductsAsync(Connection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = new Products(Connection);
                yield result.initializeProductsAsync();
                return result;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    findByName(productName) {
        return this.Products.find(pr => typeof pr !== "undefined" && pr.Name === productName);
    }
}
exports.Products = Products;
