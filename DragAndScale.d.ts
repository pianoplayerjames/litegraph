import { LiteGraphStatic } from './LiteGraph';

/**
 * DragAndScale - Handles canvas panning and zooming
 */
export class DragAndScale {
    static LiteGraph: LiteGraphStatic;

    offset: Float32Array;
    scale: number;
    max_scale: number;
    min_scale: number;
    onredraw: (() => void) | null;
    enabled: boolean;
    last_mouse: number[];
    element: HTMLElement | null;
    visible_area: Float32Array;
    dragging: boolean;

    constructor(element?: HTMLElement, skip_events?: boolean);

    bindEvents(element: HTMLElement): void;
    computeVisibleArea(viewport?: number[]): void;
    onMouse(e: MouseEvent): void;
    toCanvasContext(ctx: CanvasRenderingContext2D): void;
    convertOffsetToCanvas(pos: number[]): number[];
    convertCanvasToOffset(pos: number[], out?: number[]): number[];
    mouseDrag(x: number, y: number): void;
    changeScale(value: number, zooming_center?: number[]): void;
    changeDeltaScale(value: number, zooming_center?: number[]): void;
    reset(): void;
}

export default DragAndScale;
