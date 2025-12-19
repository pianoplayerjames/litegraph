/**
 * LGraphGroup - Represents a visual group that can contain multiple nodes
 * @class LGraphGroup
 */
class LGraphGroup {
    /**
     * Static reference to LiteGraph - can be set externally
     * @type {Object}
     */
    static LiteGraph = null;

    /**
     * Static reference to LGraphCanvas - can be set externally
     * @type {Object}
     */
    static LGraphCanvas = null;

    /**
     * Creates a new LGraphGroup instance
     * @constructor
     * @param {string} title - The title of the group
     */
    constructor(title) {
        this._ctor(title);
    }

    /**
     * Internal constructor that initializes the group properties
     * @private
     * @param {string} title - The title of the group
     */
    _ctor(title) {
        this.title = title || "Group";
        this.font_size = 24;

        // Get the default color from LGraphCanvas if available
        const LGraphCanvas = LGraphGroup.LGraphCanvas;
        this.color = LGraphCanvas?.node_colors?.pale_blue?.groupcolor || "#AAA";

        this._bounding = new Float32Array([10, 10, 140, 80]);
        this._pos = this._bounding.subarray(0, 2);
        this._size = this._bounding.subarray(2, 4);
        this._nodes = [];
        this.graph = null;

        // Define pos property with getter/setter
        Object.defineProperty(this, "pos", {
            set: function(v) {
                if (!v || v.length < 2) {
                    return;
                }
                this._pos[0] = v[0];
                this._pos[1] = v[1];
            },
            get: function() {
                return this._pos;
            },
            enumerable: true
        });

        // Define size property with getter/setter
        Object.defineProperty(this, "size", {
            set: function(v) {
                if (!v || v.length < 2) {
                    return;
                }
                this._size[0] = Math.max(140, v[0]);
                this._size[1] = Math.max(80, v[1]);
            },
            get: function() {
                return this._size;
            },
            enumerable: true
        });
    }

    /**
     * Configures the group from a serialized object
     * @param {Object} o - The configuration object
     * @param {string} o.title - The group title
     * @param {Array<number>} o.bounding - The bounding box [x, y, width, height]
     * @param {string} o.color - The group color
     * @param {number} o.font_size - The font size
     */
    configure(o) {
        this.title = o.title;
        this._bounding.set(o.bounding);
        this.color = o.color;
        this.font_size = o.font_size;
    }

    /**
     * Serializes the group to an object
     * @returns {Object} The serialized group data
     */
    serialize() {
        const b = this._bounding;
        return {
            title: this.title,
            bounding: [
                Math.round(b[0]),
                Math.round(b[1]),
                Math.round(b[2]),
                Math.round(b[3])
            ],
            color: this.color,
            font_size: this.font_size
        };
    }

    /**
     * Moves the group by the specified delta
     * @param {number} deltax - The x delta to move
     * @param {number} deltay - The y delta to move
     * @param {boolean} ignore_nodes - If true, doesn't move the nodes inside the group
     */
    move(deltax, deltay, ignore_nodes) {
        this._pos[0] += deltax;
        this._pos[1] += deltay;
        if (ignore_nodes) {
            return;
        }
        for (let i = 0; i < this._nodes.length; ++i) {
            const node = this._nodes[i];
            node.pos[0] += deltax;
            node.pos[1] += deltay;
        }
    }

    /**
     * Recomputes which nodes are inside this group
     */
    recomputeInsideNodes() {
        this._nodes.length = 0;
        const nodes = this.graph._nodes;
        const node_bounding = new Float32Array(4);

        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            node.getBounding(node_bounding);
            if (!overlapBounding(this._bounding, node_bounding)) {
                continue; // out of the visible area
            }
            this._nodes.push(node);
        }
    }

    /**
     * Checks if a point is inside the group
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} margin - Optional margin
     * @param {boolean} skip_title - If true, skips the title area
     * @returns {boolean} True if the point is inside
     */
    isPointInside(x, y, margin, skip_title) {
        margin = margin || 0;

        const LiteGraph = LGraphGroup.LiteGraph;
        let margin_top = this.graph && this.graph.isLive() ? 0 : LiteGraph?.NODE_TITLE_HEIGHT || 0;
        if (skip_title) {
            margin_top = 0;
        }
        if (this.flags && this.flags.collapsed) {
            const collapsed_width = this._collapsed_width || LiteGraph?.NODE_COLLAPSED_WIDTH || 0;
            const node_title_height = LiteGraph?.NODE_TITLE_HEIGHT || 0;
            if (
                isInsideRectangle(
                    x,
                    y,
                    this.pos[0] - margin,
                    this.pos[1] - node_title_height - margin,
                    collapsed_width + 2 * margin,
                    node_title_height + 2 * margin
                )
            ) {
                return true;
            }
        } else if (
            this.pos[0] - 4 - margin < x &&
            this.pos[0] + this.size[0] + 4 + margin > x &&
            this.pos[1] - margin_top - margin < y &&
            this.pos[1] + this.size[1] + margin > y
        ) {
            return true;
        }
        return false;
    }

    /**
     * Forces to redraw or the main canvas (LGraphNode) or the bg canvas (links)
     * @param {boolean} dirty_foreground - If true, marks the foreground as dirty
     * @param {boolean} dirty_background - If true, marks the background as dirty
     */
    setDirtyCanvas(dirty_foreground, dirty_background) {
        if (!this.graph) {
            return;
        }
        this.graph.sendActionToCanvas("setDirty", [
            dirty_foreground,
            dirty_background
        ]);
    }
}

/**
 * Checks if two bounding boxes overlap
 * @private
 * @param {Float32Array|Array<number>} a - First bounding box [x, y, width, height]
 * @param {Float32Array|Array<number>} b - Second bounding box [x, y, width, height]
 * @returns {boolean} True if the bounding boxes overlap
 */
function overlapBounding(a, b) {
    const A_end_x = a[0] + a[2];
    const A_end_y = a[1] + a[3];
    const B_end_x = b[0] + b[2];
    const B_end_y = b[1] + b[3];

    if (
        a[0] > B_end_x ||
        a[1] > B_end_y ||
        A_end_x < b[0] ||
        A_end_y < b[1]
    ) {
        return false;
    }
    return true;
}

/**
 * Checks if a point is inside a rectangle
 * @private
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} left - The left edge of the rectangle
 * @param {number} top - The top edge of the rectangle
 * @param {number} width - The width of the rectangle
 * @param {number} height - The height of the rectangle
 * @returns {boolean} True if the point is inside the rectangle
 */
function isInsideRectangle(x, y, left, top, width, height) {
    return x > left && x < left + width && y > top && y < top + height;
}

// Export as both default and named export
export default LGraphGroup;
export { LGraphGroup };
