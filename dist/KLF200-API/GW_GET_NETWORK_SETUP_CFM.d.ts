/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
export declare class GW_GET_NETWORK_SETUP_CFM extends GW_FRAME_CFM {
    readonly IPAddress: string;
    readonly Mask: string;
    readonly DefaultGateway: string;
    readonly DHCP: boolean;
    constructor(Data: Buffer);
}
