/**
 * LLink - Represents a connection between node slots
 */
export class LLink {
    id: number;
    type: string;
    origin_id: number;
    origin_slot: number;
    target_id: number;
    target_slot: number;
    data: any;
    _data: any;
    _pos: Float32Array;

    constructor(id: number, type: string, origin_id: number, origin_slot: number, target_id: number, target_slot: number);

    configure(o: any): void;
    serialize(): any[];
}

export default LLink;
