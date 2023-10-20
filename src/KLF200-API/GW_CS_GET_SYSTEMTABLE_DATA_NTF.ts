"use strict";

import { GW_FRAME_NTF } from "./common";
import { SystemTableDataEntry } from "./GW_SYSTEMTABLE_DATA";

export class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends GW_FRAME_NTF {
	public readonly NumberOfEntries: number;
	public readonly RemainingNumberOfEntries: number;
	public readonly SystemTableEntries: SystemTableDataEntry[] = [];

	constructor(Data: Buffer) {
		super(Data);

		// Read number of entries from data buffer
		this.NumberOfEntries = this.Data.readUInt8(0);

		// Read number of remaining entries from buffer
		const position = this.NumberOfEntries * 11 + 1;
		this.RemainingNumberOfEntries = this.Data.readUInt8(position);

		// Read system table data entries
		for (let entryIndex = 0; entryIndex < this.NumberOfEntries; entryIndex++) {
			const entry = new SystemTableDataEntry(this.Data.slice(entryIndex * 11 + 1, (entryIndex + 1) * 11 + 1));
			this.SystemTableEntries.push(entry);
		}
	}
}
