/**
 * CurveEditor - A widget for editing curves/splines visually
 *
 * This class provides an interactive curve editor that allows users to:
 * - Add points by clicking on the curve
 * - Move points by dragging them
 * - Remove points by dragging them outside the editor bounds
 * - Sample values from the curve at any position
 *
 * @class CurveEditor
 */
class CurveEditor {
    /**
     * Creates a new CurveEditor instance
     *
     * @param {Array<Array<number>>} points - Array of points where each point is [x, y] with values 0-1
     */
    constructor(points) {
        this.points = points;
        this.selected = -1;
        this.nearest = -1;
        this.size = null; // stores last size used
        this.must_update = true;
        this.margin = 5;
    }

    /**
     * Samples a value from the curve at position f
     * Uses linear interpolation between points
     *
     * @static
     * @param {number} f - Position to sample (0-1)
     * @param {Array<Array<number>>} points - Array of curve points
     * @returns {number} The interpolated value at position f
     */
    static sampleCurve(f, points) {
        if (!points) {
            return 0;
        }

        for (let i = 0; i < points.length - 1; ++i) {
            const p = points[i];
            const pn = points[i + 1];

            if (pn[0] < f) {
                continue;
            }

            const r = (pn[0] - p[0]);
            if (Math.abs(r) < 0.00001) {
                return p[1];
            }

            const local_f = (f - p[0]) / r;
            return p[1] * (1.0 - local_f) + pn[1] * local_f;
        }

        return 0;
    }

    /**
     * Draws the curve editor to the canvas
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Array<number>} size - The size of the editor [width, height]
     * @param {Object} graphcanvas - The graph canvas instance
     * @param {string} [background_color] - Optional background color
     * @param {string} [line_color="#666"] - Color for the curve line
     * @param {boolean} [inactive=false] - Whether the editor is inactive
     */
    draw(ctx, size, graphcanvas, background_color, line_color, inactive) {
        const points = this.points;
        if (!points) {
            return;
        }

        this.size = size;
        const w = size[0] - this.margin * 2;
        const h = size[1] - this.margin * 2;

        line_color = line_color || "#666";

        ctx.save();
        ctx.translate(this.margin, this.margin);

        if (background_color) {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#222";
            ctx.fillRect(w * 0.5, 0, 1, h);
            ctx.strokeStyle = "#333";
            ctx.strokeRect(0, 0, w, h);
        }

        ctx.strokeStyle = line_color;
        if (inactive) {
            ctx.globalAlpha = 0.5;
        }

        ctx.beginPath();
        for (let i = 0; i < points.length; ++i) {
            const p = points[i];
            ctx.lineTo(p[0] * w, (1.0 - p[1]) * h);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (!inactive) {
            for (let i = 0; i < points.length; ++i) {
                const p = points[i];
                ctx.fillStyle = this.selected === i ? "#FFF" : (this.nearest === i ? "#DDD" : "#AAA");
                ctx.beginPath();
                ctx.arc(p[0] * w, (1.0 - p[1]) * h, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    /**
     * Handles mouse down event in the curve editor
     * Creates a new point if clicked on empty space, or selects existing point
     *
     * @param {Array<number>} localpos - Local mouse position [x, y]
     * @param {Object} graphcanvas - The graph canvas instance
     * @returns {boolean} True if a point was selected or created
     */
    onMouseDown(localpos, graphcanvas) {
        const points = this.points;
        if (!points) {
            return;
        }
        if (localpos[1] < 0) {
            return;
        }

        const w = this.size[0] - this.margin * 2;
        const h = this.size[1] - this.margin * 2;
        const x = localpos[0] - this.margin;
        const y = localpos[1] - this.margin;
        const pos = [x, y];
        const max_dist = 30 / graphcanvas.ds.scale;

        // search for closer point
        this.selected = this.getCloserPoint(pos, max_dist);

        // create new point if none found
        if (this.selected === -1) {
            const point = [x / w, 1 - y / h];
            points.push(point);
            points.sort((a, b) => a[0] - b[0]);
            this.selected = points.indexOf(point);
            this.must_update = true;
        }

        if (this.selected !== -1) {
            return true;
        }
    }

    /**
     * Handles mouse move event in the curve editor
     * Moves the selected point and removes it if dragged outside bounds
     *
     * @param {Array<number>} localpos - Local mouse position [x, y]
     * @param {Object} graphcanvas - The graph canvas instance
     */
    onMouseMove(localpos, graphcanvas) {
        const points = this.points;
        if (!points) {
            return;
        }

        const s = this.selected;
        if (s < 0) {
            return;
        }

        const x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2);
        const y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2);
        const curvepos = [(localpos[0] - this.margin), (localpos[1] - this.margin)];
        const max_dist = 30 / graphcanvas.ds.scale;
        this._nearest = this.getCloserPoint(curvepos, max_dist);
        const point = points[s];

        if (point) {
            const is_edge_point = s === 0 || s === points.length - 1;

            // Remove point if dragged outside bounds (except edge points)
            if (!is_edge_point &&
                (localpos[0] < -10 || localpos[0] > this.size[0] + 10 ||
                 localpos[1] < -10 || localpos[1] > this.size[1] + 10)) {
                points.splice(s, 1);
                this.selected = -1;
                return;
            }

            // Update point position
            if (!is_edge_point) {
                point[0] = clamp(x, 0, 1);
            } else {
                point[0] = s === 0 ? 0 : 1;
            }
            point[1] = 1.0 - clamp(y, 0, 1);

            points.sort((a, b) => a[0] - b[0]);
            this.selected = points.indexOf(point);
            this.must_update = true;
        }
    }

    /**
     * Handles mouse up event in the curve editor
     * Deselects the currently selected point
     *
     * @param {Array<number>} localpos - Local mouse position [x, y]
     * @param {Object} graphcanvas - The graph canvas instance
     * @returns {boolean} Always returns false
     */
    onMouseUp(localpos, graphcanvas) {
        this.selected = -1;
        return false;
    }

    /**
     * Finds the closest point to a given position
     *
     * @param {Array<number>} pos - Position to check [x, y]
     * @param {number} [max_dist=30] - Maximum distance to consider
     * @returns {number} Index of the closest point, or -1 if none found within max_dist
     */
    getCloserPoint(pos, max_dist) {
        const points = this.points;
        if (!points) {
            return -1;
        }

        max_dist = max_dist || 30;
        const w = (this.size[0] - this.margin * 2);
        const h = (this.size[1] - this.margin * 2);
        const num = points.length;
        const p2 = [0, 0];
        let min_dist = 1000000;
        let closest = -1;
        let last_valid = -1;

        for (let i = 0; i < num; ++i) {
            const p = points[i];
            p2[0] = p[0] * w;
            p2[1] = (1.0 - p[1]) * h;

            if (p2[0] < pos[0]) {
                last_valid = i;
            }

            const dist = vec2.distance(pos, p2);
            if (dist > min_dist || dist > max_dist) {
                continue;
            }

            closest = i;
            min_dist = dist;
        }

        return closest;
    }
}

/**
 * Helper function to clamp a value between min and max
 *
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Simple vec2 distance calculation helper
 * Used for finding closest point to mouse position
 */
const vec2 = {
    distance(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// Export as both default and named export
export default CurveEditor;
export { CurveEditor };
