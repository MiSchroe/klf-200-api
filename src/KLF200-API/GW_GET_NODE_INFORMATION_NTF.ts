'use strict';

import { GW_FRAME_NTF, readZString } from "./common";
import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias, splitActuatorType } from "./GW_SYSTEMTABLE_DATA";

export class GW_GET_NODE_INFORMATION_NTF extends GW_FRAME_NTF {
    public readonly NodeID: number;
    public readonly Order: number;
    public readonly Placement: number;
    public readonly Name: string;
    public readonly Velocity: Velocity;
    public readonly ActuatorType: ActuatorType;
    public readonly ActuatorSubType: number;
    public readonly ProductType: number;
    public readonly NodeVariation: NodeVariation;
    public readonly PowerSaveMode: PowerSaveMode;
    public readonly SerialNumber: string;
    public readonly OperatingState: NodeOperatingState;
    public readonly CurrentPosition: number;
    public readonly TargetPosition: number;
    public readonly FunctionalPosition1CurrentPosition: number;
    public readonly FunctionalPosition2CurrentPosition: number;
    public readonly FunctionalPosition3CurrentPosition: number;
    public readonly FunctionalPosition4CurrentPosition: number;
    public readonly RemainingTime: number;
    public readonly TimeStamp: Date;
    public readonly ActuatorAliases: ActuatorAlias[] = [];

    constructor(Data: Buffer) {
        super(Data);

        this.NodeID = this.Data.readUInt8(0);
        this.Order = this.Data.readUInt16BE(1);
        this.Placement = this.Data.readUInt8(3);
        this.Name = readZString(this.Data.slice(4, 68));
        this.Velocity = this.Data.readUInt8(68);
        const actuatorTypes = splitActuatorType(this.Data.readUInt16BE(69));
        this.ActuatorType = actuatorTypes.ActuatorType;
        this.ActuatorSubType = actuatorTypes.ActuatorSubType;
        this.ProductType = this.Data.readUInt16BE(71);
        this.NodeVariation = this.Data.readUInt8(73);
        this.PowerSaveMode = this.Data.readUInt8(74);
        this.SerialNumber = readZString(this.Data.slice(75, 83));
        this.OperatingState = this.Data.readUInt8(83);
        this.CurrentPosition = this.Data.readUInt16BE(84);
        this.TargetPosition = this.Data.readUInt16BE(86);
        this.FunctionalPosition1CurrentPosition = this.Data.readUInt16BE(88);
        this.FunctionalPosition2CurrentPosition = this.Data.readUInt16BE(90);
        this.FunctionalPosition3CurrentPosition = this.Data.readUInt16BE(92);
        this.FunctionalPosition4CurrentPosition = this.Data.readUInt16BE(94);
        this.RemainingTime = this.Data.readUInt16BE(96);
        this.TimeStamp = new Date(this.Data.readUInt32BE(98) * 1000);

        // Read actuator aliases
        const numberOfAliases = this.Data.readUInt8(102);
        for (let index = 0; index < numberOfAliases; index++) {
            const alias = new ActuatorAlias(this.Data.readUInt16BE(index * 4 + 103), this.Data.readUInt16BE(index * 4 + 104));
            this.ActuatorAliases.push(alias);
        }
    }
}
