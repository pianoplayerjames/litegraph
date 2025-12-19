/**
 * LiteGraph.js - ESM Version
 * A graph node engine and editor similar to PD or UDK Blueprints
 *
 * Converted to ES6 modules from the original library by jagenjo
 * @see https://github.com/jagenjo/litegraph.js
 */

// Import all classes
import LiteGraph from './LiteGraph.js';
import { LGraph } from './LGraph.js';
import { LGraphNode } from './LGraphNode.js';
import { LGraphCanvas } from './LGraphCanvas.js';
import { LGraphGroup } from './LGraphGroup.js';
import { LLink } from './LLink.js';
import { DragAndScale } from './DragAndScale.js';
import { ContextMenu } from './ContextMenu.js';
import { CurveEditor } from './CurveEditor.js';

// Import node registration functions
import {
    registerAllNodes,
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
} from './nodes/index.js';

// Set up cross-references to avoid circular dependency issues
// LiteGraph needs references to all classes
LiteGraph.LGraph = LGraph;
LiteGraph.LGraphNode = LGraphNode;
LiteGraph.LGraphCanvas = LGraphCanvas;
LiteGraph.LGraphGroup = LGraphGroup;
LiteGraph.LLink = LLink;
LiteGraph.DragAndScale = DragAndScale;
LiteGraph.ContextMenu = ContextMenu;
LiteGraph.CurveEditor = CurveEditor;

// LGraph needs references
LGraph.LiteGraph = LiteGraph;
LGraph.LGraphNode = LGraphNode;
LGraph.LGraphCanvas = LGraphCanvas;
LGraph.LGraphGroup = LGraphGroup;
LGraph.LLink = LLink;

// LGraphNode needs LiteGraph reference
LGraphNode.LiteGraph = LiteGraph;

// LGraphCanvas needs references
if (typeof LGraphCanvas.setLiteGraph === 'function') {
    LGraphCanvas.setLiteGraph(LiteGraph);
} else {
    LGraphCanvas.LiteGraph = LiteGraph;
}
LGraphCanvas.LGraph = LGraph;
LGraphCanvas.LGraphNode = LGraphNode;
LGraphCanvas.LGraphGroup = LGraphGroup;
LGraphCanvas.ContextMenu = ContextMenu;

// LGraphGroup needs references
LGraphGroup.LiteGraph = LiteGraph;
LGraphGroup.LGraphCanvas = LGraphCanvas;

// DragAndScale needs LiteGraph reference
DragAndScale.LiteGraph = LiteGraph;

// ContextMenu needs LiteGraph reference
ContextMenu.LiteGraph = LiteGraph;

// Export everything
export {
    LiteGraph,
    LGraph,
    LGraphNode,
    LGraphCanvas,
    LGraphGroup,
    LLink,
    DragAndScale,
    ContextMenu,
    CurveEditor,
    // Node registration functions
    registerAllNodes,
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

// Default export is the main LiteGraph namespace (which now has all classes attached)
export default LiteGraph;
