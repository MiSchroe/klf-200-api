import { GW_FRAME_REQ } from "./common";
export declare class GW_SET_NETWORK_SETUP_REQ extends GW_FRAME_REQ {
    readonly DHCP: boolean;
    readonly IPAddress: string;
    readonly Mask: string;
    readonly DefaultGateway: string;
    constructor(DHCP: boolean, IPAddress?: string, Mask?: string, DefaultGateway?: string);
}
