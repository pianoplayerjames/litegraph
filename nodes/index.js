/**
 * LiteGraph Built-in Nodes - ESM Version
 *
 * This module exports registration functions for all built-in node types.
 * Each function takes the LiteGraph namespace and registers nodes with it.
 */

import registerAudioNodes from './audio.js';
import registerBaseNodes from './base.js';
import registerEventsNodes from './events.js';
import registerGeometryNodes from './geometry.js';
import registerGlfxNodes from './glfx.js';
import registerGlshadersNodes from './glshaders.js';
import registerGltexturesNodes from './gltextures.js';
import registerGraphicsNodes from './graphics.js';
import registerInputNodes from './input.js';
import registerInterfaceNodes from './interface.js';
import registerLogicNodes from './logic.js';
import registerMathNodes from './math.js';
import registerMath3dNodes from './math3d.js';
import registerMidiNodes from './midi.js';
import registerNetworkNodes from './network.js';
import registerOthersNodes from './others.js';
import registerStringsNodes from './strings.js';

/**
 * Register all built-in nodes with LiteGraph
 * @param {Object} LiteGraph - The LiteGraph namespace
 * @param {Object} options - Options for which node categories to register
 * @param {boolean} options.audio - Register audio nodes (default: true)
 * @param {boolean} options.base - Register base nodes (default: true)
 * @param {boolean} options.events - Register events nodes (default: true)
 * @param {boolean} options.geometry - Register geometry nodes (default: true)
 * @param {boolean} options.glfx - Register glfx nodes (default: true)
 * @param {boolean} options.glshaders - Register glshaders nodes (default: true)
 * @param {boolean} options.gltextures - Register gltextures nodes (default: true)
 * @param {boolean} options.graphics - Register graphics nodes (default: true)
 * @param {boolean} options.input - Register input nodes (default: true)
 * @param {boolean} options.interface - Register interface nodes (default: true)
 * @param {boolean} options.logic - Register logic nodes (default: true)
 * @param {boolean} options.math - Register math nodes (default: true)
 * @param {boolean} options.math3d - Register math3d nodes (default: true)
 * @param {boolean} options.midi - Register midi nodes (default: true)
 * @param {boolean} options.network - Register network nodes (default: true)
 * @param {boolean} options.others - Register others nodes (default: true)
 * @param {boolean} options.strings - Register strings nodes (default: true)
 */
export function registerAllNodes(LiteGraph, options = {}) {
    const defaults = {
        audio: true,
        base: true,
        events: true,
        geometry: true,
        glfx: true,
        glshaders: true,
        gltextures: true,
        graphics: true,
        input: true,
        interface: true,
        logic: true,
        math: true,
        math3d: true,
        midi: true,
        network: true,
        others: true,
        strings: true
    };

    const opts = { ...defaults, ...options };

    if (opts.base) registerBaseNodes(LiteGraph);
    if (opts.math) registerMathNodes(LiteGraph);
    if (opts.math3d) registerMath3dNodes(LiteGraph);
    if (opts.logic) registerLogicNodes(LiteGraph);
    if (opts.strings) registerStringsNodes(LiteGraph);
    if (opts.events) registerEventsNodes(LiteGraph);
    if (opts.input) registerInputNodes(LiteGraph);
    if (opts.interface) registerInterfaceNodes(LiteGraph);
    if (opts.audio) registerAudioNodes(LiteGraph);
    if (opts.midi) registerMidiNodes(LiteGraph);
    if (opts.geometry) registerGeometryNodes(LiteGraph);
    if (opts.graphics) registerGraphicsNodes(LiteGraph);
    if (opts.glfx) registerGlfxNodes(LiteGraph);
    if (opts.glshaders) registerGlshadersNodes(LiteGraph);
    if (opts.gltextures) registerGltexturesNodes(LiteGraph);
    if (opts.network) registerNetworkNodes(LiteGraph);
    if (opts.others) registerOthersNodes(LiteGraph);
}

// Export individual registration functions
export {
    registerAudioNodes,
    registerBaseNodes,
    registerEventsNodes,
    registerGeometryNodes,
    registerGlfxNodes,
    registerGlshadersNodes,
    registerGltexturesNodes,
    registerGraphicsNodes,
    registerInputNodes,
    registerInterfaceNodes,
    registerLogicNodes,
    registerMathNodes,
    registerMath3dNodes,
    registerMidiNodes,
    registerNetworkNodes,
    registerOthersNodes,
    registerStringsNodes
};

export default registerAllNodes;
