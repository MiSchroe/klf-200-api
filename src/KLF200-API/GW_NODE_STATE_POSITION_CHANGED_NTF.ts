'use strict';

import { GW_FRAME_NTF, readZString } from "./common";
import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias, splitActuatorType } from "./GW_SYSTEMTABLE_DATA";

export class GW_NODE_STATE_POSITION_CHANGED_NTF extends GW_FRAME_NTF {
    public readonly NodeID: number;
    public readonly OperatingState: NodeOperatingState;
    public readonly CurrentPosition: number;
    public readonly TargetPosition: number;
    public readonly FunctionalPosition1CurrentPosition: number;
    public readonly FunctionalPosition2CurrentPosition: number;
    public readonly FunctionalPosition3CurrentPosition: number;
    public readonly FunctionalPosition4CurrentPosition: number;
    public readonly RemainingTime: number;
    public readonly TimeStamp: Date;

    constructor(Data: Buffer) {
        super(Data);

        this.NodeID = this.Data.readUInt8(0);
        this.OperatingState = this.Data.readUInt8(1);
        this.CurrentPosition = this.Data.readUInt16BE(2);
        this.TargetPosition = this.Data.readUInt16BE(4);
        this.FunctionalPosition1CurrentPosition = this.Data.readUInt16BE(6);
        this.FunctionalPosition2CurrentPosition = this.Data.readUInt16BE(8);
        this.FunctionalPosition3CurrentPosition = this.Data.readUInt16BE(10);
        this.FunctionalPosition4CurrentPosition = this.Data.readUInt16BE(12);
        this.RemainingTime = this.Data.readUInt16BE(14);
        this.TimeStamp = new Date(this.Data.readUInt32BE(16) * 1000);
    }
}
