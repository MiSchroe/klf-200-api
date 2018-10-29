'use strict';

import { GW_FRAME_NTF } from "./common";

export class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends GW_FRAME_NTF {
    public readonly AddedNodes: number[] = [];
    public readonly RemovedNodes: number[] = [];

    public constructor(Data: Buffer) {
        super(Data);

        // Added nodes
        for (let index = 0; index < 26; index++) {
            let addedNodeByte = this.Data.readUInt8(index);
            if (addedNodeByte !== 0) {
                // Check bits
                for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                    if ((addedNodeByte & 0x01) === 0x01) {
                        this.AddedNodes.push(index * 8 + bitIndex);
                    }
                    addedNodeByte = addedNodeByte >>> 1;    // shift one bit
                }
            }
        }

        // Removed nodes
        for (let index = 0; index < 26; index++) {
            let removedNodeByte = this.Data.readUInt8(index + 26);
            if (removedNodeByte !== 0) {
                // Check bits
                for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                    if ((removedNodeByte & 0x01) === 0x01) {
                        this.RemovedNodes.push(index * 8 + bitIndex);
                    }
                    removedNodeByte = removedNodeByte >>> 1;    // shift one bit
                }
            }
        }
    }
}
