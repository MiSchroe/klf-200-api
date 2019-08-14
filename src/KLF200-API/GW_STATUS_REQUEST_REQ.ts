"use strict";

import { GW_FRAME_COMMAND_REQ } from "./common";
import { StatusType } from "./GW_COMMAND";
import { isArray } from "util";

export class GW_STATUS_REQUEST_REQ extends GW_FRAME_COMMAND_REQ {
    constructor(readonly Nodes: number[] | number, readonly StatusType: StatusType, readonly FunctionalParameters: number[] = []) {
        super(26);

        const buff = this.Data.slice(this.offset);

        buff.writeUInt16BE(this.SessionID, 0);

        // Multiple nodes are provided
        if (isArray(this.Nodes))
        {
            if (this.Nodes.length > 20)
                throw new Error("Too many nodes.");

            buff.writeUInt8(this.Nodes.length, 2);
            for (let nodeIndex = 0; nodeIndex < this.Nodes.length; nodeIndex++) {
                const node = this.Nodes[nodeIndex];
                buff.writeUInt8(node, 3 + nodeIndex);
            }
        }
        else
        {
            buff.writeUInt8(1, 2);
            buff.writeUInt8(this.Nodes, 3);
        }

        buff.writeUInt8(this.StatusType, 23);

        let FPI1 = 0;
        let FPI2 = 0;
        for (let functionalParameterIndex = 0; functionalParameterIndex < this.FunctionalParameters.length; functionalParameterIndex++) {
            const functionalParameter = this.FunctionalParameters[functionalParameterIndex];
            const functionalParameterID = functionalParameter - 1;
            if (functionalParameterID < 0 || functionalParameterID > 15)
                throw new Error("Functional paramter ID out of range.");

            if (functionalParameterID < 8)
            {
                FPI1 |= 0x80 >>> functionalParameterID;
            }
            else
            {
                FPI2 |= 0x80 >>> (functionalParameterID - 8);
            }
        }
        buff.writeUInt8(FPI1, 24);
        buff.writeUInt8(FPI2, 25);
    }
}