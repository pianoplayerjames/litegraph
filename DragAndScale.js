/**
 * DragAndScale class handles canvas panning and zooming with mouse/touch interactions.
 * This class provides functionality for dragging, scaling, and managing viewport transformations
 * on a canvas element.
 *
 * @class DragAndScale
 * @exports DragAndScale
 */
class DragAndScale {
    /**
     * Reference to LiteGraph for pointer events and utilities.
     * This is set externally to avoid circular dependencies.
     * @static
     * @type {Object|null}
     */
    static LiteGraph = null;

    /**
     * Creates a new DragAndScale instance.
     *
     * @constructor
     * @param {HTMLElement} [element] - The DOM element to attach drag and scale functionality to
     * @param {boolean} [skip_events=false] - If true, events won't be automatically bound
     */
    constructor(element, skip_events) {
        /**
         * Current offset of the canvas
         * @type {Float32Array}
         */
        this.offset = new Float32Array([0, 0]);

        /**
         * Current scale factor
         * @type {number}
         */
        this.scale = 1;

        /**
         * Maximum allowed scale factor
         * @type {number}
         */
        this.max_scale = 10;

        /**
         * Minimum allowed scale factor
         * @type {number}
         */
        this.min_scale = 0.1;

        /**
         * Callback function called when redraw is needed
         * @type {Function|null}
         */
        this.onredraw = null;

        /**
         * Whether drag and scale is enabled
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Last recorded mouse position
         * @type {Array<number>}
         */
        this.last_mouse = [0, 0];

        /**
         * The DOM element being controlled
         * @type {HTMLElement|null}
         */
        this.element = null;

        /**
         * Visible area bounds [x, y, width, height]
         * @type {Float32Array}
         */
        this.visible_area = new Float32Array(4);

        /**
         * Whether currently dragging
         * @type {boolean}
         */
        this.dragging = false;

        /**
         * Optional viewport bounds [x, y, width, height]
         * @type {Array<number>|null}
         */
        this.viewport = null;

        /**
         * Optional mouse event callback
         * @type {Function|null}
         */
        this.onmouse = null;

        /**
         * Bound mouse callback for event listeners
         * @private
         * @type {Function|null}
         */
        this._binded_mouse_callback = null;

        if (element) {
            this.element = element;
            if (!skip_events) {
                this.bindEvents(element);
            }
        }
    }

    /**
     * Binds mouse and wheel events to the element.
     *
     * @param {HTMLElement} element - The element to bind events to
     */
    bindEvents(element) {
        this.last_mouse = new Float32Array(2);

        this._binded_mouse_callback = this.onMouse.bind(this);

        const LiteGraph = DragAndScale.LiteGraph;
        if (LiteGraph && LiteGraph.pointerListenerAdd) {
            LiteGraph.pointerListenerAdd(element, "down", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(element, "move", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(element, "up", this._binded_mouse_callback);
        }

        element.addEventListener(
            "mousewheel",
            this._binded_mouse_callback,
            false
        );
        element.addEventListener("wheel", this._binded_mouse_callback, false);
    }

    /**
     * Computes the visible area based on current offset and scale.
     *
     * @param {Array<number>} [viewport] - Optional viewport bounds [x, y, width, height]
     */
    computeVisibleArea(viewport) {
        if (!this.element) {
            this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
            return;
        }
        let width = this.element.width;
        let height = this.element.height;
        let startx = -this.offset[0];
        let starty = -this.offset[1];
        if (viewport) {
            startx += viewport[0] / this.scale;
            starty += viewport[1] / this.scale;
            width = viewport[2];
            height = viewport[3];
        }
        const endx = startx + width / this.scale;
        const endy = starty + height / this.scale;
        this.visible_area[0] = startx;
        this.visible_area[1] = starty;
        this.visible_area[2] = endx - startx;
        this.visible_area[3] = endy - starty;
    }

    /**
     * Handles mouse events for dragging and scaling.
     *
     * @param {MouseEvent} e - The mouse event
     * @returns {boolean} - Returns false if event should be prevented
     */
    onMouse(e) {
        if (!this.enabled) {
            return;
        }

        const LiteGraph = DragAndScale.LiteGraph;
        const canvas = this.element;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.canvasx = x;
        e.canvasy = y;
        e.dragging = this.dragging;

        const is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));

        let ignore = false;
        if (this.onmouse) {
            ignore = this.onmouse(e);
        }

        if (LiteGraph && e.type == LiteGraph.pointerevents_method + "down" && is_inside) {
            this.dragging = true;
            LiteGraph.pointerListenerRemove(canvas, "move", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(document, "move", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(document, "up", this._binded_mouse_callback);
        } else if (LiteGraph && e.type == LiteGraph.pointerevents_method + "move") {
            if (!ignore) {
                const deltax = x - this.last_mouse[0];
                const deltay = y - this.last_mouse[1];
                if (this.dragging) {
                    this.mouseDrag(deltax, deltay);
                }
            }
        } else if (LiteGraph && e.type == LiteGraph.pointerevents_method + "up") {
            this.dragging = false;
            LiteGraph.pointerListenerRemove(document, "move", this._binded_mouse_callback);
            LiteGraph.pointerListenerRemove(document, "up", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(canvas, "move", this._binded_mouse_callback);
        } else if (is_inside &&
            (e.type == "mousewheel" ||
            e.type == "wheel" ||
            e.type == "DOMMouseScroll")
        ) {
            e.eventType = "mousewheel";
            if (e.type == "wheel") {
                e.wheel = -e.deltaY;
            } else {
                e.wheel =
                    e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;
            }

            // from stack overflow
            e.delta = e.wheelDelta
                ? e.wheelDelta / 40
                : e.deltaY
                ? -e.deltaY / 3
                : 0;
            this.changeDeltaScale(1.0 + e.delta * 0.05);
        }

        this.last_mouse[0] = x;
        this.last_mouse[1] = y;

        if (is_inside) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    /**
     * Applies the current transformation to a canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    toCanvasContext(ctx) {
        ctx.scale(this.scale, this.scale);
        ctx.translate(this.offset[0], this.offset[1]);
    }

    /**
     * Converts offset coordinates to canvas coordinates.
     *
     * @param {Array<number>} pos - Position [x, y] in offset space
     * @returns {Array<number>} Position [x, y] in canvas space
     */
    convertOffsetToCanvas(pos) {
        return [
            (pos[0] + this.offset[0]) * this.scale,
            (pos[1] + this.offset[1]) * this.scale
        ];
    }

    /**
     * Converts canvas coordinates to offset coordinates.
     *
     * @param {Array<number>} pos - Position [x, y] in canvas space
     * @param {Array<number>} [out] - Optional output array to avoid allocation
     * @returns {Array<number>} Position [x, y] in offset space
     */
    convertCanvasToOffset(pos, out) {
        out = out || [0, 0];
        out[0] = pos[0] / this.scale - this.offset[0];
        out[1] = pos[1] / this.scale - this.offset[1];
        return out;
    }

    /**
     * Handles mouse drag to update offset.
     *
     * @param {number} x - Delta x movement
     * @param {number} y - Delta y movement
     */
    mouseDrag(x, y) {
        this.offset[0] += x / this.scale;
        this.offset[1] += y / this.scale;

        if (this.onredraw) {
            this.onredraw(this);
        }
    }

    /**
     * Changes the scale to a specific value with optional zooming center.
     *
     * @param {number} value - New scale value
     * @param {Array<number>} [zooming_center] - Center point [x, y] for zoom
     */
    changeScale(value, zooming_center) {
        if (value < this.min_scale) {
            value = this.min_scale;
        } else if (value > this.max_scale) {
            value = this.max_scale;
        }

        if (value == this.scale) {
            return;
        }

        if (!this.element) {
            return;
        }

        const rect = this.element.getBoundingClientRect();
        if (!rect) {
            return;
        }

        zooming_center = zooming_center || [
            rect.width * 0.5,
            rect.height * 0.5
        ];
        const center = this.convertCanvasToOffset(zooming_center);
        this.scale = value;
        if (Math.abs(this.scale - 1) < 0.01) {
            this.scale = 1;
        }

        const new_center = this.convertCanvasToOffset(zooming_center);
        const delta_offset = [
            new_center[0] - center[0],
            new_center[1] - center[1]
        ];

        this.offset[0] += delta_offset[0];
        this.offset[1] += delta_offset[1];

        if (this.onredraw) {
            this.onredraw(this);
        }
    }

    /**
     * Changes the scale by a delta factor.
     *
     * @param {number} value - Scale multiplier (e.g., 1.1 for 10% increase)
     * @param {Array<number>} [zooming_center] - Center point [x, y] for zoom
     */
    changeDeltaScale(value, zooming_center) {
        this.changeScale(this.scale * value, zooming_center);
    }

    /**
     * Resets scale and offset to default values.
     */
    reset() {
        this.scale = 1;
        this.offset[0] = 0;
        this.offset[1] = 0;
    }
}

// Export both default and named export
export default DragAndScale;
export { DragAndScale };
