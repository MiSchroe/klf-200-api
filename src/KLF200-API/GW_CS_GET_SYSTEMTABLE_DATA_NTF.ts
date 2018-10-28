'use strict';

import { GW_FRAME_NTF } from "./common";
import { SystemTableDataEntry } from "./GW_SYSTEMTABLE_DATA";

export class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends GW_FRAME_NTF {
    private _numberOfEntries: number = -1;
    get NumberOfEntries(): number {
        if (this._numberOfEntries === -1) {
            // Read number of entries from data buffer
            this._numberOfEntries = this.Data.readUInt8(0);
        }

        return this._numberOfEntries;
    }

    private _remainingNumberOfEntries: number = -1;
    get RemainingNumberOfEntries(): number {
        if (this._remainingNumberOfEntries === -1) {
            // Read from buffer first
            const position = this.NumberOfEntries * 11 + 1;
            this._remainingNumberOfEntries = this.Data.readUInt8(position);
        }

        return this._remainingNumberOfEntries;
    }

    private _SystemTableEntries: SystemTableDataEntry[] = [];
    get SystemTableEntries(): SystemTableDataEntry[] {
        if (this._SystemTableEntries.length !== this._numberOfEntries) {
            for (let entryIndex = 0; entryIndex < this.NumberOfEntries; entryIndex++) {
                const entry = new SystemTableDataEntry(this.Data.slice(entryIndex * 11 + 1, (entryIndex + 1) * 11 + 1));
                this._SystemTableEntries.push(entry);
            }
        }

        return this._SystemTableEntries;
    }
}
