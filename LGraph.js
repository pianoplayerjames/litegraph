/**
 * LGraph - A graph that contains nodes and handles their execution
 * @class LGraph
 */
class LGraph {
    // Static properties that can be set externally to avoid circular dependencies
    static LiteGraph = null;
    static LGraphCanvas = null;
    static LGraphNode = null;
    static LGraphGroup = null;
    static LLink = null;

    // Status constants
    static STATUS_STOPPED = 1;
    static STATUS_RUNNING = 2;

    // Default supported types
    static supported_types = ["number", "string", "boolean"];

    /**
     * Creates a new graph instance
     * @param {Object} o - Optional configuration object
     */
    constructor(o) {
        const LiteGraph = LGraph.LiteGraph;

        if (LiteGraph && LiteGraph.debug) {
            console.log("Graph created");
        }

        this.list_of_graphcanvas = null;
        this.clear();

        if (o) {
            this.configure(o);
        }
    }

    /**
     * Returns the supported types for this graph
     * @returns {Array} Array of supported type strings
     */
    getSupportedTypes() {
        return this.supported_types || LGraph.supported_types;
    }

    /**
     * Removes all nodes from this graph
     */
    clear() {
        const LiteGraph = LGraph.LiteGraph;

        this.stop();
        this.status = LGraph.STATUS_STOPPED;

        this.last_node_id = 0;
        this.last_link_id = 0;

        this._version = -1; // used to detect changes

        // safe clear
        if (this._nodes) {
            for (let i = 0; i < this._nodes.length; ++i) {
                const node = this._nodes[i];
                if (node.onRemoved) {
                    node.onRemoved();
                }
            }
        }

        // nodes
        this._nodes = [];
        this._nodes_by_id = {};
        this._nodes_in_order = []; // nodes sorted in execution order
        this._nodes_executable = null; // nodes that contain onExecute sorted in execution order

        // other scene stuff
        this._groups = [];

        // links
        this.links = {}; // container with all the links

        // iterations
        this.iteration = 0;

        // custom data
        this.config = {};
        this.vars = {};
        this.extra = {}; // to store custom data

        // timing
        this.globaltime = 0;
        this.runningtime = 0;
        this.fixedtime = 0;
        this.fixedtime_lapse = 0.01;
        this.elapsed_time = 0.01;
        this.last_update_time = 0;
        this.starttime = 0;

        this.catch_errors = true;

        this.nodes_executing = [];
        this.nodes_actioning = [];
        this.nodes_executedAction = [];

        // subgraph_data
        this.inputs = {};
        this.outputs = {};

        // notify canvas to redraw
        this.change();

        this.sendActionToCanvas("clear");
    }

    /**
     * Attach a canvas to this graph
     * @param {LGraphCanvas} graphcanvas - The canvas instance to attach
     */
    attachCanvas(graphcanvas) {
        const LGraphCanvas = LGraph.LGraphCanvas;

        if (LGraphCanvas && graphcanvas.constructor !== LGraphCanvas) {
            throw "attachCanvas expects a LGraphCanvas instance";
        }

        if (graphcanvas.graph && graphcanvas.graph !== this) {
            graphcanvas.graph.detachCanvas(graphcanvas);
        }

        graphcanvas.graph = this;

        if (!this.list_of_graphcanvas) {
            this.list_of_graphcanvas = [];
        }
        this.list_of_graphcanvas.push(graphcanvas);
    }

    /**
     * Detach a canvas from this graph
     * @param {LGraphCanvas} graphcanvas - The canvas instance to detach
     */
    detachCanvas(graphcanvas) {
        if (!this.list_of_graphcanvas) {
            return;
        }

        const pos = this.list_of_graphcanvas.indexOf(graphcanvas);
        if (pos === -1) {
            return;
        }
        graphcanvas.graph = null;
        this.list_of_graphcanvas.splice(pos, 1);
    }

    /**
     * Starts running this graph every interval milliseconds
     * @param {number} interval - Amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
     */
    start(interval) {
        const LiteGraph = LGraph.LiteGraph;

        if (this.status === LGraph.STATUS_RUNNING) {
            return;
        }
        this.status = LGraph.STATUS_RUNNING;

        if (this.onPlayEvent) {
            this.onPlayEvent();
        }

        this.sendEventToAllNodes("onStart");

        // launch
        this.starttime = LiteGraph.getTime();
        this.last_update_time = this.starttime;
        interval = interval || 0;
        const that = this;

        // execute once per frame
        if (interval === 0 && typeof window !== "undefined" && window.requestAnimationFrame) {
            function on_frame() {
                if (that.execution_timer_id !== -1) {
                    return;
                }
                window.requestAnimationFrame(on_frame);
                if (that.onBeforeStep) {
                    that.onBeforeStep();
                }
                that.runStep(1, !that.catch_errors);
                if (that.onAfterStep) {
                    that.onAfterStep();
                }
            }
            this.execution_timer_id = -1;
            on_frame();
        } else {
            // execute every 'interval' ms
            this.execution_timer_id = setInterval(function() {
                if (that.onBeforeStep) {
                    that.onBeforeStep();
                }
                that.runStep(1, !that.catch_errors);
                if (that.onAfterStep) {
                    that.onAfterStep();
                }
            }, interval);
        }
    }

    /**
     * Stops the execution loop of the graph
     */
    stop() {
        if (this.status === LGraph.STATUS_STOPPED) {
            return;
        }

        this.status = LGraph.STATUS_STOPPED;

        if (this.onStopEvent) {
            this.onStopEvent();
        }

        if (this.execution_timer_id != null) {
            if (this.execution_timer_id !== -1) {
                clearInterval(this.execution_timer_id);
            }
            this.execution_timer_id = null;
        }

        this.sendEventToAllNodes("onStop");
    }

    /**
     * Run N steps (cycles) of the graph
     * @param {number} num - Number of steps to run, default is 1
     * @param {boolean} do_not_catch_errors - If you want to try/catch errors
     * @param {number} limit - Max number of nodes to execute (used to execute from start to a node)
     */
    runStep(num, do_not_catch_errors, limit) {
        const LiteGraph = LGraph.LiteGraph;

        num = num || 1;

        const start = LiteGraph.getTime();
        this.globaltime = 0.001 * (start - this.starttime);

        // from now on it will iterate only on executable nodes which is faster
        const nodes = this._nodes_executable ? this._nodes_executable : this._nodes;
        if (!nodes) {
            return;
        }

        limit = limit || nodes.length;

        if (do_not_catch_errors) {
            // iterations
            for (let i = 0; i < num; i++) {
                for (let j = 0; j < limit; ++j) {
                    const node = nodes[j];
                    if (LiteGraph.use_deferred_actions && node._waiting_actions && node._waiting_actions.length) {
                        node.executePendingActions();
                    }
                    if (node.mode === LiteGraph.ALWAYS && node.onExecute) {
                        // wrap node.onExecute();
                        node.doExecute();
                    }
                }

                this.fixedtime += this.fixedtime_lapse;
                if (this.onExecuteStep) {
                    this.onExecuteStep();
                }
            }

            if (this.onAfterExecute) {
                this.onAfterExecute();
            }
        } else {
            // catch errors
            try {
                // iterations
                for (let i = 0; i < num; i++) {
                    for (let j = 0; j < limit; ++j) {
                        const node = nodes[j];
                        if (LiteGraph.use_deferred_actions && node._waiting_actions && node._waiting_actions.length) {
                            node.executePendingActions();
                        }
                        if (node.mode === LiteGraph.ALWAYS && node.onExecute) {
                            node.onExecute();
                        }
                    }

                    this.fixedtime += this.fixedtime_lapse;
                    if (this.onExecuteStep) {
                        this.onExecuteStep();
                    }
                }

                if (this.onAfterExecute) {
                    this.onAfterExecute();
                }
                this.errors_in_execution = false;
            } catch (err) {
                this.errors_in_execution = true;
                if (LiteGraph.throw_errors) {
                    throw err;
                }
                if (LiteGraph.debug) {
                    console.log("Error during execution: " + err);
                }
                this.stop();
            }
        }

        const now = LiteGraph.getTime();
        let elapsed = now - start;
        if (elapsed === 0) {
            elapsed = 1;
        }
        this.execution_time = 0.001 * elapsed;
        this.globaltime += 0.001 * elapsed;
        this.iteration += 1;
        this.elapsed_time = (now - this.last_update_time) * 0.001;
        this.last_update_time = now;
        this.nodes_executing = [];
        this.nodes_actioning = [];
        this.nodes_executedAction = [];
    }

    /**
     * Updates the graph execution order according to relevance of the nodes
     * Nodes with only outputs have more relevance than nodes with only inputs
     */
    updateExecutionOrder() {
        this._nodes_in_order = this.computeExecutionOrder(false);
        this._nodes_executable = [];
        for (let i = 0; i < this._nodes_in_order.length; ++i) {
            if (this._nodes_in_order[i].onExecute) {
                this._nodes_executable.push(this._nodes_in_order[i]);
            }
        }
    }

    /**
     * Computes the executable nodes in order and returns them
     * @param {boolean} only_onExecute - Only include nodes with onExecute
     * @param {boolean} set_level - Set the level property on nodes
     * @returns {Array} Array of nodes in execution order
     */
    computeExecutionOrder(only_onExecute, set_level) {
        const L = [];
        const S = [];
        const M = {};
        const visited_links = {}; // to avoid repeating links
        const remaining_links = {};

        // search for the nodes without inputs (starting nodes)
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            const node = this._nodes[i];
            if (only_onExecute && !node.onExecute) {
                continue;
            }

            M[node.id] = node; // add to pending nodes

            let num = 0; // num of input connections
            if (node.inputs) {
                for (let j = 0, l2 = node.inputs.length; j < l2; j++) {
                    if (node.inputs[j] && node.inputs[j].link != null) {
                        num += 1;
                    }
                }
            }

            if (num === 0) {
                // is a starting node
                S.push(node);
                if (set_level) {
                    node._level = 1;
                }
            } else {
                if (set_level) {
                    node._level = 0;
                }
                remaining_links[node.id] = num;
            }
        }

        while (true) {
            if (S.length === 0) {
                break;
            }

            // get an starting node
            const node = S.shift();
            L.push(node); // add to ordered list
            delete M[node.id]; // remove from the pending nodes

            if (!node.outputs) {
                continue;
            }

            // for every output
            for (let i = 0; i < node.outputs.length; i++) {
                const output = node.outputs[i];
                // not connected
                if (output == null || output.links == null || output.links.length === 0) {
                    continue;
                }

                // for every connection
                for (let j = 0; j < output.links.length; j++) {
                    const link_id = output.links[j];
                    const link = this.links[link_id];
                    if (!link) {
                        continue;
                    }

                    // already visited link (ignore it)
                    if (visited_links[link.id]) {
                        continue;
                    }

                    const target_node = this.getNodeById(link.target_id);
                    if (target_node == null) {
                        visited_links[link.id] = true;
                        continue;
                    }

                    if (set_level && (!target_node._level || target_node._level <= node._level)) {
                        target_node._level = node._level + 1;
                    }

                    visited_links[link.id] = true; // mark as visited
                    remaining_links[target_node.id] -= 1; // reduce the number of links remaining
                    if (remaining_links[target_node.id] === 0) {
                        S.push(target_node);
                    }
                }
            }
        }

        // the remaining ones (loops)
        for (const i in M) {
            L.push(M[i]);
        }

        const LiteGraph = LGraph.LiteGraph;
        if (L.length !== this._nodes.length && LiteGraph && LiteGraph.debug) {
            console.warn("something went wrong, nodes missing");
        }

        const l = L.length;

        // save order number in the node
        for (let i = 0; i < l; ++i) {
            L[i].order = i;
        }

        // sort now by priority
        L.sort(function(A, B) {
            const Ap = A.constructor.priority || A.priority || 0;
            const Bp = B.constructor.priority || B.priority || 0;
            if (Ap === Bp) {
                // if same priority, sort by order
                return A.order - B.order;
            }
            return Ap - Bp; // sort by priority
        });

        // save order number in the node, again...
        for (let i = 0; i < l; ++i) {
            L[i].order = i;
        }

        return L;
    }

    /**
     * Returns all the nodes that could affect this one (ancestors) by crawling all the inputs recursively
     * It doesn't include the node itself
     * @param {LGraphNode} node - The node to find ancestors for
     * @returns {Array} An array with all the LGraphNodes that affect this node, in order of execution
     */
    getAncestors(node) {
        const ancestors = [];
        const pending = [node];
        const visited = {};

        while (pending.length) {
            const current = pending.shift();
            if (!current.inputs) {
                continue;
            }
            if (!visited[current.id] && current !== node) {
                visited[current.id] = true;
                ancestors.push(current);
            }

            for (let i = 0; i < current.inputs.length; ++i) {
                const input = current.getInputNode(i);
                if (input && ancestors.indexOf(input) === -1) {
                    pending.push(input);
                }
            }
        }

        ancestors.sort(function(a, b) {
            return a.order - b.order;
        });
        return ancestors;
    }

    /**
     * Positions every node in a more readable manner
     * @param {number} margin - Margin between nodes
     * @param {number} layout - Layout type (horizontal or vertical)
     */
    arrange(margin, layout) {
        const LiteGraph = LGraph.LiteGraph;

        margin = margin || 100;

        const nodes = this.computeExecutionOrder(false, true);
        const columns = [];
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            const col = node._level || 1;
            if (!columns[col]) {
                columns[col] = [];
            }
            columns[col].push(node);
        }

        let x = margin;

        for (let i = 0; i < columns.length; ++i) {
            const column = columns[i];
            if (!column) {
                continue;
            }
            let max_size = 100;
            let y = margin + LiteGraph.NODE_TITLE_HEIGHT;
            for (let j = 0; j < column.length; ++j) {
                const node = column[j];
                node.pos[0] = (layout === LiteGraph.VERTICAL_LAYOUT) ? y : x;
                node.pos[1] = (layout === LiteGraph.VERTICAL_LAYOUT) ? x : y;
                const max_size_index = (layout === LiteGraph.VERTICAL_LAYOUT) ? 1 : 0;
                if (node.size[max_size_index] > max_size) {
                    max_size = node.size[max_size_index];
                }
                const node_size_index = (layout === LiteGraph.VERTICAL_LAYOUT) ? 0 : 1;
                y += node.size[node_size_index] + margin + LiteGraph.NODE_TITLE_HEIGHT;
            }
            x += max_size + margin;
        }

        this.setDirtyCanvas(true, true);
    }

    /**
     * Returns the amount of time the graph has been running in milliseconds
     * @returns {number} Number of milliseconds the graph has been running
     */
    getTime() {
        return this.globaltime;
    }

    /**
     * Returns the amount of time accumulated using the fixedtime_lapse var
     * This is used in context where the time increments should be constant
     * @returns {number} Number of milliseconds the graph has been running
     */
    getFixedTime() {
        return this.fixedtime;
    }

    /**
     * Returns the amount of time it took to compute the latest iteration
     * Take into account that this number could be not correct if the nodes are using graphical actions
     * @returns {number} Number of milliseconds it took the last cycle
     */
    getElapsedTime() {
        return this.elapsed_time;
    }

    /**
     * Sends an event to all the nodes, useful to trigger stuff
     * @param {string} eventname - The name of the event (function to be called)
     * @param {Array} params - Parameters in array format
     * @param {number} mode - Execution mode filter
     */
    sendEventToAllNodes(eventname, params, mode) {
        const LiteGraph = LGraph.LiteGraph;

        mode = mode || LiteGraph.ALWAYS;

        const nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes;
        if (!nodes) {
            return;
        }

        for (let j = 0, l = nodes.length; j < l; ++j) {
            const node = nodes[j];

            if (node.constructor === LiteGraph.Subgraph && eventname !== "onExecute") {
                if (node.mode === mode) {
                    node.sendEventToAllNodes(eventname, params, mode);
                }
                continue;
            }

            if (!node[eventname] || node.mode !== mode) {
                continue;
            }
            if (params === undefined) {
                node[eventname]();
            } else if (params && params.constructor === Array) {
                node[eventname].apply(node, params);
            } else {
                node[eventname](params);
            }
        }
    }

    /**
     * Sends an action to all attached canvases
     * @param {string} action - Action name to call on canvases
     * @param {Array} params - Parameters to pass to the action
     */
    sendActionToCanvas(action, params) {
        if (!this.list_of_graphcanvas) {
            return;
        }

        for (let i = 0; i < this.list_of_graphcanvas.length; ++i) {
            const c = this.list_of_graphcanvas[i];
            if (c[action]) {
                c[action].apply(c, params);
            }
        }
    }

    /**
     * Adds a new node instance to this graph
     * @param {LGraphNode} node - The instance of the node
     * @param {boolean} skip_compute_order - Skip recomputing execution order
     * @returns {LGraphNode} The added node
     */
    add(node, skip_compute_order) {
        const LiteGraph = LGraph.LiteGraph;
        const LGraphGroup = LGraph.LGraphGroup;

        if (!node) {
            return;
        }

        // groups
        if (LGraphGroup && node.constructor === LGraphGroup) {
            this._groups.push(node);
            this.setDirtyCanvas(true);
            this.change();
            node.graph = this;
            this._version++;
            return;
        }

        // nodes
        if (node.id !== -1 && this._nodes_by_id[node.id] != null) {
            console.warn("LiteGraph: there is already a node with this ID, changing it");
            if (LiteGraph.use_uuids) {
                node.id = LiteGraph.uuidv4();
            } else {
                node.id = ++this.last_node_id;
            }
        }

        if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
            throw "LiteGraph: max number of nodes in a graph reached";
        }

        // give him an id
        if (LiteGraph.use_uuids) {
            if (node.id == null || node.id === -1) {
                node.id = LiteGraph.uuidv4();
            }
        } else {
            if (node.id == null || node.id === -1) {
                node.id = ++this.last_node_id;
            } else if (this.last_node_id < node.id) {
                this.last_node_id = node.id;
            }
        }

        node.graph = this;
        this._version++;

        this._nodes.push(node);
        this._nodes_by_id[node.id] = node;

        if (node.onAdded) {
            node.onAdded(this);
        }

        if (this.config.align_to_grid) {
            node.alignToGrid();
        }

        if (!skip_compute_order) {
            this.updateExecutionOrder();
        }

        if (this.onNodeAdded) {
            this.onNodeAdded(node);
        }

        this.setDirtyCanvas(true);
        this.change();

        return node; // to chain actions
    }

    /**
     * Removes a node from the graph
     * @param {LGraphNode} node - The instance of the node
     */
    remove(node) {
        const LiteGraph = LGraph.LiteGraph;

        if (LiteGraph && node.constructor === LiteGraph.LGraphGroup) {
            const index = this._groups.indexOf(node);
            if (index !== -1) {
                this._groups.splice(index, 1);
            }
            node.graph = null;
            this._version++;
            this.setDirtyCanvas(true, true);
            this.change();
            return;
        }

        if (this._nodes_by_id[node.id] == null) {
            return;
        } // not found

        if (node.ignore_remove) {
            return;
        } // cannot be removed

        this.beforeChange(); // sure? - almost sure is wrong

        // disconnect inputs
        if (node.inputs) {
            for (let i = 0; i < node.inputs.length; i++) {
                const slot = node.inputs[i];
                if (slot.link != null) {
                    node.disconnectInput(i);
                }
            }
        }

        // disconnect outputs
        if (node.outputs) {
            for (let i = 0; i < node.outputs.length; i++) {
                const slot = node.outputs[i];
                if (slot.links != null && slot.links.length) {
                    node.disconnectOutput(i);
                }
            }
        }

        // callback
        if (node.onRemoved) {
            node.onRemoved();
        }

        node.graph = null;
        this._version++;

        // remove from canvas render
        if (this.list_of_graphcanvas) {
            for (let i = 0; i < this.list_of_graphcanvas.length; ++i) {
                const canvas = this.list_of_graphcanvas[i];
                if (canvas.selected_nodes[node.id]) {
                    delete canvas.selected_nodes[node.id];
                }
                if (canvas.node_dragged === node) {
                    canvas.node_dragged = null;
                }
            }
        }

        // remove from containers
        const pos = this._nodes.indexOf(node);
        if (pos !== -1) {
            this._nodes.splice(pos, 1);
        }
        delete this._nodes_by_id[node.id];

        if (this.onNodeRemoved) {
            this.onNodeRemoved(node);
        }

        // close panels
        this.sendActionToCanvas("checkPanels");

        this.setDirtyCanvas(true, true);
        this.afterChange(); // sure? - almost sure is wrong
        this.change();

        this.updateExecutionOrder();
    }

    /**
     * Returns a node by its id
     * @param {number} id - The node id
     * @returns {LGraphNode} The node or null
     */
    getNodeById(id) {
        if (id == null) {
            return null;
        }
        return this._nodes_by_id[id];
    }

    /**
     * Returns a list of nodes that matches a class
     * @param {Function} classObject - The class itself (not a string)
     * @param {Array} result - Optional result array to reuse
     * @returns {Array} A list with all the nodes of this type
     */
    findNodesByClass(classObject, result) {
        result = result || [];
        result.length = 0;
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].constructor === classObject) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }

    /**
     * Returns a list of nodes that matches a type
     * @param {string} type - The name of the node type
     * @param {Array} result - Optional result array to reuse
     * @returns {Array} A list with all the nodes of this type
     */
    findNodesByType(type, result) {
        type = type.toLowerCase();
        result = result || [];
        result.length = 0;
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].type.toLowerCase() === type) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }

    /**
     * Returns the first node that matches a name in its title
     * @param {string} title - The title of the node to search
     * @returns {LGraphNode} The node or null
     */
    findNodeByTitle(title) {
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].title === title) {
                return this._nodes[i];
            }
        }
        return null;
    }

    /**
     * Returns a list of nodes that matches a title
     * @param {string} title - The title of the node to search
     * @returns {Array} A list with all the nodes with this title
     */
    findNodesByTitle(title) {
        const result = [];
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].title === title) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }

    /**
     * Returns the top-most node in this position of the canvas
     * @param {number} x - The x coordinate in canvas space
     * @param {number} y - The y coordinate in canvas space
     * @param {Array} nodes_list - A list with all the nodes to search from, by default is all the nodes in the graph
     * @param {number} margin - Optional margin for hit testing
     * @returns {LGraphNode} The node at this position or null
     */
    getNodeOnPos(x, y, nodes_list, margin) {
        nodes_list = nodes_list || this._nodes;
        let nRet = null;
        for (let i = nodes_list.length - 1; i >= 0; i--) {
            const n = nodes_list[i];
            if (n.isPointInside(x, y, margin)) {
                return n;
            }
        }
        return nRet;
    }

    /**
     * Returns the top-most group in that position
     * @param {number} x - The x coordinate in canvas space
     * @param {number} y - The y coordinate in canvas space
     * @returns {LGraphGroup} The group or null
     */
    getGroupOnPos(x, y) {
        for (let i = this._groups.length - 1; i >= 0; i--) {
            const g = this._groups[i];
            if (g.isPointInside(x, y, 2, true)) {
                return g;
            }
        }
        return null;
    }

    /**
     * Checks that the node type matches the node type registered
     * Used when replacing a nodetype by a newer version during execution
     * This replaces the ones using the old version with the new version
     */
    checkNodeTypes() {
        const LiteGraph = LGraph.LiteGraph;

        let changes = false;
        for (let i = 0; i < this._nodes.length; i++) {
            const node = this._nodes[i];
            const ctor = LiteGraph.registered_node_types[node.type];
            if (node.constructor === ctor) {
                continue;
            }
            console.log("node being replaced by newer version: " + node.type);
            const newnode = LiteGraph.createNode(node.type);
            changes = true;
            this._nodes[i] = newnode;
            newnode.configure(node.serialize());
            newnode.graph = this;
            this._nodes_by_id[newnode.id] = newnode;
            if (node.inputs) {
                newnode.inputs = node.inputs.concat();
            }
            if (node.outputs) {
                newnode.outputs = node.outputs.concat();
            }
        }
        this.updateExecutionOrder();
    }

    /**
     * Handles action events for the graph
     * @param {string} action - The action name
     * @param {*} param - Action parameters
     * @param {Object} options - Additional options
     */
    onAction(action, param, options) {
        const LiteGraph = LGraph.LiteGraph;

        this._input_nodes = this.findNodesByClass(LiteGraph.GraphInput, this._input_nodes);
        for (let i = 0; i < this._input_nodes.length; ++i) {
            const node = this._input_nodes[i];
            if (node.properties.name !== action) {
                continue;
            }
            // wrap node.onAction(action, param);
            node.actionDo(action, param, options);
            break;
        }
    }

    /**
     * Triggers an event
     * @param {string} action - The action name
     * @param {*} param - Action parameters
     */
    trigger(action, param) {
        if (this.onTrigger) {
            this.onTrigger(action, param);
        }
    }

    /**
     * Tell this graph it has a global graph input of this type
     * @param {string} name - Input name
     * @param {string} type - Input type
     * @param {*} value - Optional initial value
     */
    addInput(name, type, value) {
        const input = this.inputs[name];
        if (input) {
            // already exist
            return;
        }

        this.beforeChange();
        this.inputs[name] = { name: name, type: type, value: value };
        this._version++;
        this.afterChange();

        if (this.onInputAdded) {
            this.onInputAdded(name, type);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }

    /**
     * Assign data to the global graph input
     * @param {string} name - Input name
     * @param {*} data - The data to assign
     */
    setInputData(name, data) {
        const input = this.inputs[name];
        if (!input) {
            return;
        }
        input.value = data;
    }

    /**
     * Returns the current value of a global graph input
     * @param {string} name - Input name
     * @returns {*} The data
     */
    getInputData(name) {
        const input = this.inputs[name];
        if (!input) {
            return null;
        }
        return input.value;
    }

    /**
     * Changes the name of a global graph input
     * @param {string} old_name - Old input name
     * @param {string} name - New input name
     * @returns {boolean} Success status
     */
    renameInput(old_name, name) {
        if (name === old_name) {
            return;
        }

        if (!this.inputs[old_name]) {
            return false;
        }

        if (this.inputs[name]) {
            console.error("there is already one input with that name");
            return false;
        }

        this.inputs[name] = this.inputs[old_name];
        delete this.inputs[old_name];
        this._version++;

        if (this.onInputRenamed) {
            this.onInputRenamed(old_name, name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }

    /**
     * Changes the type of a global graph input
     * @param {string} name - Input name
     * @param {string} type - New input type
     * @returns {boolean} Success status
     */
    changeInputType(name, type) {
        if (!this.inputs[name]) {
            return false;
        }

        if (this.inputs[name].type &&
            String(this.inputs[name].type).toLowerCase() === String(type).toLowerCase()) {
            return;
        }

        this.inputs[name].type = type;
        this._version++;
        if (this.onInputTypeChanged) {
            this.onInputTypeChanged(name, type);
        }
    }

    /**
     * Removes a global graph input
     * @param {string} name - Input name
     * @returns {boolean} Success status
     */
    removeInput(name) {
        if (!this.inputs[name]) {
            return false;
        }

        delete this.inputs[name];
        this._version++;

        if (this.onInputRemoved) {
            this.onInputRemoved(name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
        return true;
    }

    /**
     * Creates a global graph output
     * @param {string} name - Output name
     * @param {string} type - Output type
     * @param {*} value - Optional initial value
     */
    addOutput(name, type, value) {
        this.outputs[name] = { name: name, type: type, value: value };
        this._version++;

        if (this.onOutputAdded) {
            this.onOutputAdded(name, type);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }

    /**
     * Assign data to the global output
     * @param {string} name - Output name
     * @param {*} value - The value to assign
     */
    setOutputData(name, value) {
        const output = this.outputs[name];
        if (!output) {
            return;
        }
        output.value = value;
    }

    /**
     * Returns the current value of a global graph output
     * @param {string} name - Output name
     * @returns {*} The data
     */
    getOutputData(name) {
        const output = this.outputs[name];
        if (!output) {
            return null;
        }
        return output.value;
    }

    /**
     * Renames a global graph output
     * @param {string} old_name - Old output name
     * @param {string} name - New output name
     * @returns {boolean} Success status
     */
    renameOutput(old_name, name) {
        if (!this.outputs[old_name]) {
            return false;
        }

        if (this.outputs[name]) {
            console.error("there is already one output with that name");
            return false;
        }

        this.outputs[name] = this.outputs[old_name];
        delete this.outputs[old_name];
        this._version++;

        if (this.onOutputRenamed) {
            this.onOutputRenamed(old_name, name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }

    /**
     * Changes the type of a global graph output
     * @param {string} name - Output name
     * @param {string} type - New output type
     * @returns {boolean} Success status
     */
    changeOutputType(name, type) {
        if (!this.outputs[name]) {
            return false;
        }

        if (this.outputs[name].type &&
            String(this.outputs[name].type).toLowerCase() === String(type).toLowerCase()) {
            return;
        }

        this.outputs[name].type = type;
        this._version++;
        if (this.onOutputTypeChanged) {
            this.onOutputTypeChanged(name, type);
        }
    }

    /**
     * Removes a global graph output
     * @param {string} name - Output name
     * @returns {boolean} Success status
     */
    removeOutput(name) {
        if (!this.outputs[name]) {
            return false;
        }
        delete this.outputs[name];
        this._version++;

        if (this.onOutputRemoved) {
            this.onOutputRemoved(name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
        return true;
    }

    /**
     * Triggers input nodes by title
     * @param {string} name - Node title
     * @param {*} value - Value to pass
     */
    triggerInput(name, value) {
        const nodes = this.findNodesByTitle(name);
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i].onTrigger(value);
        }
    }

    /**
     * Sets a callback for nodes by title
     * @param {string} name - Node title
     * @param {Function} func - Callback function
     */
    setCallback(name, func) {
        const nodes = this.findNodesByTitle(name);
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i].setTrigger(func);
        }
    }

    /**
     * Called before any change is made to the graph (used for undo)
     * @param {*} info - Change information
     */
    beforeChange(info) {
        if (this.onBeforeChange) {
            this.onBeforeChange(this, info);
        }
        this.sendActionToCanvas("onBeforeChange", this);
    }

    /**
     * Called after any change is made to the graph (used to resend actions)
     * @param {*} info - Change information
     */
    afterChange(info) {
        if (this.onAfterChange) {
            this.onAfterChange(this, info);
        }
        this.sendActionToCanvas("onAfterChange", this);
    }

    /**
     * Called when a connection changes
     * @param {LGraphNode} node - The affected node
     * @param {Object} link_info - Link information
     */
    connectionChange(node, link_info) {
        this.updateExecutionOrder();
        if (this.onConnectionChange) {
            this.onConnectionChange(node);
        }
        this._version++;
        this.sendActionToCanvas("onConnectionChange");
    }

    /**
     * Returns if the graph is in live mode
     * @returns {boolean} True if any attached canvas is in live mode
     */
    isLive() {
        if (!this.list_of_graphcanvas) {
            return false;
        }

        for (let i = 0; i < this.list_of_graphcanvas.length; ++i) {
            const c = this.list_of_graphcanvas[i];
            if (c.live_mode) {
                return true;
            }
        }
        return false;
    }

    /**
     * Clears the triggered slot animation in all links (stop visual animation)
     */
    clearTriggeredSlots() {
        for (const i in this.links) {
            const link_info = this.links[i];
            if (!link_info) {
                continue;
            }
            if (link_info._last_time) {
                link_info._last_time = 0;
            }
        }
    }

    /**
     * Called when something visually changed (not the graph!)
     */
    change() {
        const LiteGraph = LGraph.LiteGraph;

        if (LiteGraph && LiteGraph.debug) {
            console.log("Graph changed");
        }
        this.sendActionToCanvas("setDirty", [true, true]);
        if (this.on_change) {
            this.on_change(this);
        }
    }

    /**
     * Sets the canvas as dirty
     * @param {boolean} fg - Foreground dirty flag
     * @param {boolean} bg - Background dirty flag
     */
    setDirtyCanvas(fg, bg) {
        this.sendActionToCanvas("setDirty", [fg, bg]);
    }

    /**
     * Destroys a link
     * @param {number} link_id - The link id to remove
     */
    removeLink(link_id) {
        const link = this.links[link_id];
        if (!link) {
            return;
        }
        const node = this.getNodeById(link.target_id);
        if (node) {
            node.disconnectInput(link.target_slot);
        }
    }

    /**
     * Creates an object containing all the info about this graph, it can be serialized
     * @returns {Object} Serialized graph data
     */
    serialize() {
        const LiteGraph = LGraph.LiteGraph;
        const LLink = LGraph.LLink;

        const nodes_info = [];
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            nodes_info.push(this._nodes[i].serialize());
        }

        // pack link info into a non-verbose format
        const links = [];
        for (const i in this.links) {
            // links is an OBJECT
            let link = this.links[i];
            if (!link.serialize) {
                // weird bug I haven't solved yet
                console.warn("weird LLink bug, link info is not a LLink but a regular object");
                const link2 = new LLink();
                for (const j in link) {
                    link2[j] = link[j];
                }
                this.links[i] = link2;
                link = link2;
            }

            links.push(link.serialize());
        }

        const groups_info = [];
        for (let i = 0; i < this._groups.length; ++i) {
            groups_info.push(this._groups[i].serialize());
        }

        const data = {
            last_node_id: this.last_node_id,
            last_link_id: this.last_link_id,
            nodes: nodes_info,
            links: links,
            groups: groups_info,
            config: this.config,
            extra: this.extra,
            version: LiteGraph.VERSION
        };

        if (this.onSerialize) {
            this.onSerialize(data);
        }

        return data;
    }

    /**
     * Configure a graph from a JSON object
     * @param {Object} data - The graph data to configure from
     * @param {boolean} keep_old - Keep existing nodes if true
     * @returns {boolean} Returns true if there was any error parsing
     */
    configure(data, keep_old) {
        const LiteGraph = LGraph.LiteGraph;
        const LGraphNode = LGraph.LGraphNode;
        const LLink = LGraph.LLink;

        if (!data) {
            return;
        }

        if (!keep_old) {
            this.clear();
        }

        const nodes = data.nodes;

        // decode links info (they are very verbose)
        if (data.links && data.links.constructor === Array) {
            const links = [];
            for (let i = 0; i < data.links.length; ++i) {
                const link_data = data.links[i];
                if (!link_data) {
                    // weird bug
                    console.warn("serialized graph link data contains errors, skipping.");
                    continue;
                }
                const link = new LLink();
                link.configure(link_data);
                links[link.id] = link;
            }
            data.links = links;
        }

        // copy all stored fields
        for (const i in data) {
            if (i === "nodes" || i === "groups") {
                // links must be accepted
                continue;
            }
            this[i] = data[i];
        }

        let error = false;

        // create nodes
        this._nodes = [];
        if (nodes) {
            for (let i = 0, l = nodes.length; i < l; ++i) {
                const n_info = nodes[i]; // stored info
                let node = LiteGraph.createNode(n_info.type, n_info.title);
                if (!node) {
                    if (LiteGraph.debug) {
                        console.log("Node not found or has errors: " + n_info.type);
                    }

                    // in case of error we create a replacement node to avoid losing info
                    node = new LGraphNode();
                    node.last_serialization = n_info;
                    node.has_errors = true;
                    error = true;
                }

                node.id = n_info.id; // id it or it will create a new id
                this.add(node, true); // add before configure, otherwise configure cannot create links
            }

            // configure nodes afterwards so they can reach each other
            for (let i = 0, l = nodes.length; i < l; ++i) {
                const n_info = nodes[i];
                const node = this.getNodeById(n_info.id);
                if (node) {
                    node.configure(n_info);
                }
            }
        }

        // groups
        this._groups.length = 0;
        if (data.groups) {
            for (let i = 0; i < data.groups.length; ++i) {
                const group = new LiteGraph.LGraphGroup();
                group.configure(data.groups[i]);
                this.add(group);
            }
        }

        this.updateExecutionOrder();

        this.extra = data.extra || {};

        if (this.onConfigure) {
            this.onConfigure(data);
        }

        this._version++;
        this.setDirtyCanvas(true, true);
        return error;
    }

    /**
     * Loads a graph from a URL or File/Blob
     * @param {string|File|Blob} url - URL or File/Blob to load from
     * @param {Function} callback - Callback when loading is complete
     */
    load(url, callback) {
        const that = this;

        // from file
        if (url.constructor === File || url.constructor === Blob) {
            const reader = new FileReader();
            reader.addEventListener('load', function(event) {
                const data = JSON.parse(event.target.result);
                that.configure(data);
                if (callback) {
                    callback();
                }
            });

            reader.readAsText(url);
            return;
        }

        // is a string, then an URL
        const req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.send(null);
        req.onload = function(oEvent) {
            if (req.status !== 200) {
                console.error("Error loading graph:", req.status, req.response);
                return;
            }
            const data = JSON.parse(req.response);
            that.configure(data);
            if (callback) {
                callback();
            }
        };
        req.onerror = function(err) {
            console.error("Error loading graph:", err);
        };
    }

    /**
     * Node trace callback (for debugging)
     * @param {LGraphNode} node - The node being traced
     * @param {string} msg - Trace message
     * @param {string} color - Color for the trace
     */
    onNodeTrace(node, msg, color) {
        // TODO
    }
}

// Export as both default and named export
export { LGraph };
export default LGraph;
