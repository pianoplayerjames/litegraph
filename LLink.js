/**
 * LLink - Represents a connection between two nodes in the graph
 *
 * A link connects an output slot of one node (origin) to an input slot
 * of another node (target), allowing data to flow between nodes.
 */
class LLink {
    /**
     * Creates a new link between two nodes
     *
     * @param {number} id - Unique identifier for this link
     * @param {string} type - The data type being transmitted through this link
     * @param {number} origin_id - ID of the source node
     * @param {number} origin_slot - Index of the output slot on the source node
     * @param {number} target_id - ID of the target node
     * @param {number} target_slot - Index of the input slot on the target node
     */
    constructor(id, type, origin_id, origin_slot, target_id, target_slot) {
        this.id = id;
        this.type = type;
        this.origin_id = origin_id;
        this.origin_slot = origin_slot;
        this.target_id = target_id;
        this.target_slot = target_slot;

        this._data = null;
        this._pos = new Float32Array(2); // center position
    }

    /**
     * Configures the link from serialized data
     *
     * @param {Array|Object} o - Either an array [id, origin_id, origin_slot, target_id, target_slot, type]
     *                          or an object with named properties
     */
    configure(o) {
        if (o.constructor === Array) {
            this.id = o[0];
            this.origin_id = o[1];
            this.origin_slot = o[2];
            this.target_id = o[3];
            this.target_slot = o[4];
            this.type = o[5];
        } else {
            this.id = o.id;
            this.type = o.type;
            this.origin_id = o.origin_id;
            this.origin_slot = o.origin_slot;
            this.target_id = o.target_id;
            this.target_slot = o.target_slot;
        }
    }

    /**
     * Serializes the link to an array format for storage/transmission
     *
     * @returns {Array} Array containing [id, origin_id, origin_slot, target_id, target_slot, type]
     */
    serialize() {
        return [
            this.id,
            this.origin_id,
            this.origin_slot,
            this.target_id,
            this.target_slot,
            this.type
        ];
    }
}

// Export as both default and named export
export { LLink };
export default LLink;
