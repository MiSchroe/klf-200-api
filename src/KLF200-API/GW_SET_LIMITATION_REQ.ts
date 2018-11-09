'use strict';

import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, ParameterActive, PriorityLevelLock, getNextSessionID, LockTime as lt, FunctionalParameter } from "./GW_COMMAND";
import { isArray } from "util";

export class GW_SET_LIMITATION_REQ extends GW_FRAME_REQ {
    public readonly SessionID: number;

    constructor(readonly Nodes: number[] | number, readonly LimitationValueMin: number, readonly LimitationValueMax: number, readonly LimitationTime: number, readonly PriorityLevel: PriorityLevel = 3, readonly CommandOriginator: CommandOriginator = 1, readonly ParameterActive: ParameterActive = 0) {
        super();

        this.SessionID = getNextSessionID();
        const buff = this.Data.slice(this.offset);

        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.ParameterActive, 25);
        buff.writeUInt16BE(this.LimitationValueMin, 26);
        buff.writeUInt16BE(this.LimitationValueMax, 28);
        buff.writeUInt8(this.LimitationTime, 30);

        // Multiple nodes are provided
        if (isArray(this.Nodes))
        {
            if (this.Nodes.length > 20)
                throw "Too many nodes.";

            buff.writeUInt8(this.Nodes.length, 4);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 5 + nodeIndex);
            }
        }
        else
        {
            buff.writeUInt8(1, 4);
            buff.writeUInt8(this.Nodes, 5);
        }
    }

    protected InitializeBuffer() {
        this.AllocBuffer(31);
    }
}