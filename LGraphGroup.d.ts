import { LiteGraphStatic } from './LiteGraph';
import { LGraphCanvas } from './LGraphCanvas';

export interface SerializedGroup {
    title: string;
    bounding: number[];
    color?: string;
    font_size?: number;
}

/**
 * LGraphGroup - Container for grouping nodes visually
 */
export class LGraphGroup {
    static LiteGraph: LiteGraphStatic;
    static LGraphCanvas: typeof LGraphCanvas;

    title: string;
    font_size: number;
    color: string;
    _bounding: Float32Array;
    _pos: Float32Array;
    _size: Float32Array;
    graph: any;

    constructor(title?: string);

    configure(o: SerializedGroup): void;
    serialize(): SerializedGroup;
    move(deltax: number, deltay: number, ignore_nodes?: boolean): void;
    recomputeInsideNodes(): void;
    isPointInside(x: number, y: number, margin?: number, skip_title?: boolean): boolean;
    setDirtyCanvas(dirty: boolean, dirty_bg?: boolean): void;
}

export default LGraphGroup;
