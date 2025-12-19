/**
 * CurveEditor - Bezier curve editor for animation curves
 */
export class CurveEditor {
    points: number[][];
    selected: number;
    nearest: number;
    size: number[] | null;
    must_update: boolean;
    margin: number;

    constructor(points?: number[][]);

    addPoint(p: number[], index?: number): void;
    removePoint(index: number): void;
    clear(): void;
    getValueAt(x: number): number;
    draw(ctx: CanvasRenderingContext2D, size: number[], graphcanvas?: any, background_color?: string, line_color?: string, inactive?: boolean): void;
    onMouseDown(localpos: number[], graphcanvas: any): boolean;
    onMouseMove(localpos: number[], graphcanvas: any): boolean;
    onMouseUp(localpos: number[], graphcanvas: any): boolean;
    sampleCurve(f: number, points: number[][]): number;
}

export default CurveEditor;
