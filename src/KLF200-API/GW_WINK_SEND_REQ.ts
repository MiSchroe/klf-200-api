'use strict';

import { GW_FRAME_REQ } from "./common";
import { CommandOriginator, PriorityLevel, getNextSessionID } from "./GW_COMMAND";
import { isArray } from "util";

export class GW_WINK_SEND_REQ extends GW_FRAME_REQ {
    public readonly SessionID: number;

    constructor(readonly Nodes: number[] | number, readonly EnableWink: boolean = true, readonly WinkTime: number = 254, readonly PriorityLevel: PriorityLevel = 3, readonly CommandOriginator: CommandOriginator = 1) {
        super();

        this.SessionID = getNextSessionID();
        const buff = this.Data.slice(this.offset);

        buff.writeUInt16BE(this.SessionID, 0);
        buff.writeUInt8(this.CommandOriginator, 2);
        buff.writeUInt8(this.PriorityLevel, 3);
        buff.writeUInt8(this.EnableWink ? 1 : 0, 4);
        buff.writeUInt8(this.WinkTime, 5);

        // Multiple nodes are provided
        if (isArray(this.Nodes))
        {
            if (this.Nodes.length > 20)
                throw "Too many nodes.";

            buff.writeUInt8(this.Nodes.length, 6);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 7 + nodeIndex);
            }
        }
        else
        {
            buff.writeUInt8(1, 6);
            buff.writeUInt8(this.Nodes, 7);
        }
    }

    protected InitializeBuffer() {
        this.AllocBuffer(27);
    }
}