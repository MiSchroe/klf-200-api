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
const GW_NODE_INFORMATION_CHANGED_NTF_1 = require("./KLF200-API/GW_NODE_INFORMATION_CHANGED_NTF");
const GW_NODE_STATE_POSITION_CHANGED_NTF_1 = require("./KLF200-API/GW_NODE_STATE_POSITION_CHANGED_NTF");
const GW_COMMAND_SEND_REQ_1 = require("./KLF200-API/GW_COMMAND_SEND_REQ");
const GW_GET_ALL_NODES_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_ALL_NODES_INFORMATION_REQ");
const GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF_1 = require("./KLF200-API/GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF");
const GW_CS_SYSTEM_TABLE_UPDATE_NTF_1 = require("./KLF200-API/GW_CS_SYSTEM_TABLE_UPDATE_NTF");
const GW_GET_NODE_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_NODE_INFORMATION_REQ");
'use strict';
const InverseProductTypes = [
    GW_SYSTEMTABLE_DATA_1.ActuatorType.WindowOpener,
    GW_SYSTEMTABLE_DATA_1.ActuatorType.Light,
    GW_SYSTEMTABLE_DATA_1.ActuatorType.OnOffSwitch,
    GW_SYSTEMTABLE_DATA_1.ActuatorType.VentilationPoint,
    GW_SYSTEMTABLE_DATA_1.ActuatorType.ExteriorHeating
];
class Product {
    constructor(Connection, frame) {
        this.Connection = Connection;
        this.propertyChangedEvent = new TypedEvent_1.TypedEvent();
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
        this.Connection.on(this.onNotificationHandler, [common_1.GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF, common_1.GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF]);
    }
    get Name() { return this._name; }
    setNameAsync(newName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_NODE_NAME_REQ_1.GW_SET_NODE_NAME_REQ(this.NodeID, newName));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    this._name = newName;
                    return Promise.resolve();
                }
                else {
                    return Promise.reject(confirmationFrame.Status);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
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
    get NodeVariation() { return this._nodeVariation; }
    setNodeVariationAsync(newNodeVariation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_SET_NODE_VARIATION_REQ_1.GW_SET_NODE_VARIATION_REQ(this.NodeID, newNodeVariation));
                if (confirmationFrame.Status === common_1.GW_COMMON_STATUS.SUCCESS) {
                    this._nodeVariation = newNodeVariation;
                    return Promise.resolve();
                }
                else {
                    return Promise.reject(confirmationFrame.Status);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
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
                    return Promise.reject(confirmationFrame.Status);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    get Order() { return this._order; }
    setOrderAsync(newOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setOrderAndPlacementAsync(newOrder, this._placement);
        });
    }
    get Placement() { return this._placement; }
    setPlacementAsync(newPlacement) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setOrderAndPlacementAsync(this._order, newPlacement);
        });
    }
    get State() { return this._state; }
    get CurrentPositionRaw() { return this._currentPositionRaw; }
    get TargetPositionRaw() { return this._targetPositionRaw; }
    get FP1CurrentPositionRaw() { return this._fp1CurrentPositionRaw; }
    get FP2CurrentPositionRaw() { return this._fp2CurrentPositionRaw; }
    get FP3CurrentPositionRaw() { return this._fp3CurrentPositionRaw; }
    get FP4CurrentPositionRaw() { return this._fp4CurrentPositionRaw; }
    get RemainingTime() { return this._remainingTime; }
    get TimeStamp() { return this._timeStamp; }
    convertPositionRaw(positionRaw) {
        if (positionRaw > 0xC800) {
            return NaN; // Can't calculate the current position
        }
        let result = positionRaw / 0xC800;
        if (InverseProductTypes.indexOf(this.TypeID) !== -1) {
            // Percentage has to be calculated reverse
            result = 1 - result;
        }
        return result;
    }
    convertPosition(position) {
        if (position < 0 || position > 1)
            throw "Position value out of range.";
        if (InverseProductTypes.indexOf(this.TypeID) !== -1) {
            // Percentage has to be calculated reverse
            position = 1 - position;
        }
        return 0xC800 * position;
    }
    get CurrentPosition() {
        return this.convertPositionRaw(this._currentPositionRaw);
    }
    setCurrentPositionAsync(newPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const req = new GW_COMMAND_SEND_REQ_1.GW_COMMAND_SEND_REQ(this.NodeID, this.convertPosition(newPosition));
                // const dispose = this.connection.on(frame => {
                //     if (frame instanceof GW_SESSION_FINISHED_NTF && frame.SessionID === req.SessionID) {
                //         dispose.dispose();
                //     }
                // }, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
                const confirmationFrame = yield this.Connection.sendFrameAsync(req);
                return confirmationFrame.SessionID;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    get TargetPosition() {
        return this.convertPositionRaw(this._targetPositionRaw);
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_NODE_INFORMATION_CHANGED_NTF_1.GW_NODE_INFORMATION_CHANGED_NTF) {
            this.onNodeInformationChanged(frame);
        }
        else if (frame instanceof GW_NODE_STATE_POSITION_CHANGED_NTF_1.GW_NODE_STATE_POSITION_CHANGED_NTF) {
            this.onNodeStatePositionChanged(frame);
        }
    }
    onNodeInformationChanged(frame) {
        if (frame.NodeID === this.NodeID) {
            if (frame.Name !== this._name) {
                this._name = frame.Name;
                this.propertyChangedEvent.emit({ o: this, propertyName: "Name", propertyValue: this.Name });
            }
            if (frame.NodeVariation !== this._nodeVariation) {
                this._nodeVariation = frame.NodeVariation;
                this.propertyChangedEvent.emit({ o: this, propertyName: "NodeVariation", propertyValue: this.NodeVariation });
            }
            if (frame.Order !== this._order) {
                this._order = frame.Order;
                this.propertyChangedEvent.emit({ o: this, propertyName: "Order", propertyValue: this.Order });
            }
            if (frame.Placement !== this._placement) {
                this._placement = frame.Placement;
                this.propertyChangedEvent.emit({ o: this, propertyName: "Placement", propertyValue: this.Placement });
            }
        }
    }
    onNodeStatePositionChanged(frame) {
        if (frame.NodeID === this.NodeID) {
            if (frame.OperatingState !== this._state) {
                this._state = frame.OperatingState;
                this.propertyChangedEvent.emit({ o: this, propertyName: "State", propertyValue: this.State });
            }
            if (frame.CurrentPosition !== this._currentPositionRaw) {
                this._currentPositionRaw = frame.CurrentPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "CurrentPositionRaw", propertyValue: this.CurrentPositionRaw });
                this.propertyChangedEvent.emit({ o: this, propertyName: "CurrentPosition", propertyValue: this.CurrentPosition });
            }
            if (frame.TargetPosition !== this._targetPositionRaw) {
                this._targetPositionRaw = frame.TargetPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "TargetPositionRaw", propertyValue: this.TargetPositionRaw });
                this.propertyChangedEvent.emit({ o: this, propertyName: "TargetPosition", propertyValue: this.TargetPosition });
            }
            if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
                this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "FP1CurrentPositionRaw", propertyValue: this.FP1CurrentPositionRaw });
            }
            if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
                this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "FP2CurrentPositionRaw", propertyValue: this.FP2CurrentPositionRaw });
            }
            if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
                this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "FP3CurrentPositionRaw", propertyValue: this.FP3CurrentPositionRaw });
            }
            if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
                this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
                this.propertyChangedEvent.emit({ o: this, propertyName: "FP4CurrentPositionRaw", propertyValue: this.FP4CurrentPositionRaw });
            }
            if (frame.RemainingTime !== this._remainingTime) {
                this._remainingTime = frame.RemainingTime;
                this.propertyChangedEvent.emit({ o: this, propertyName: "RemainingTime", propertyValue: this.RemainingTime });
            }
            if (frame.TimeStamp !== this._timeStamp) {
                this._timeStamp = frame.TimeStamp;
                this.propertyChangedEvent.emit({ o: this, propertyName: "TimeStamp", propertyValue: this.TimeStamp });
            }
        }
    }
}
exports.Product = Product;
class Products {
    constructor(Connection) {
        this.Connection = Connection;
        this.Products = [];
    }
    initializeProductsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
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
                    const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_GET_ALL_NODES_INFORMATION_REQ_1.GW_GET_ALL_NODES_INFORMATION_REQ());
                }));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_CS_SYSTEM_TABLE_UPDATE_NTF_1.GW_CS_SYSTEM_TABLE_UPDATE_NTF) {
            // Remove nodes
            frame.RemovedNodes.forEach(nodeID => { this.Products[nodeID] = undefined; });
            // Add nodes
            frame.AddedNodes.forEach((nodeID) => __awaiter(this, void 0, void 0, function* () { this.Products[nodeID] = yield this.addNodeAsync(nodeID); }));
        }
    }
    addNodeAsync(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    const dispose = this.Connection.on(frame => {
                        dispose.dispose();
                        resolve(new Product(this.Connection, frame));
                    }, [common_1.GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                    yield this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ_1.GW_GET_NODE_INFORMATION_REQ(nodeID));
                }));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
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
}
exports.Products = Products;
// /**
//  * Create a new products object.
//  * Use the products object to retrieve a list of products known to your KLF interface.
//  * @constructor
//  * @param {connection} connection The connection object that handles the communication to the KLF interface.
//  */
// function products(connection) {
//     this.connection = connection;
// }
// /**
//  * Gets a list of your products.
//  * @return {Promise} Returns a promise that resolves to the products array.
//  */
// products.prototype.getAsync = function () {
//     return this.connection.postAsync(urlBuilder.products, 'get', null)
//         .then((res) => {
//             return res.data;
//         });
// };
// module.exports = products;
//# sourceMappingURL=products.js.map