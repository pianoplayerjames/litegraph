# litegraph-esm

A modern ES6 module conversion of [LiteGraph.js](https://github.com/jagenjo/litegraph.js) - a graph node engine and editor similar to PD or UDK Blueprints.

## Features

- **Pure ES6 Modules** - No UMD/CommonJS wrappers, tree-shakeable
- **ES6 Classes** - Modern class syntax throughout
- **TypeScript Declarations** - Full type definitions included
- **API Compatible** - Maintains compatibility with the original LiteGraph.js API
- **Zero Dependencies** - No external dependencies

## Installation

```bash
npm install litegraph-esm
# or
bun add litegraph-esm
```

## Usage

### ES Module Import

```javascript
// Import everything
import LiteGraph, { LGraph, LGraphNode, LGraphCanvas } from 'litegraph-esm';
import 'litegraph-esm/css/litegraph.css';

// Or import individual modules
import { LGraph } from 'litegraph-esm/LGraph';
import { LGraphCanvas } from 'litegraph-esm/LGraphCanvas';
```

### Basic Example

```javascript
import LiteGraph, { LGraph, LGraphCanvas } from 'litegraph-esm';
import 'litegraph-esm/css/litegraph.css';

// Create a graph
const graph = new LGraph();

// Create a canvas to render the graph
const canvas = document.getElementById('mycanvas');
const graphCanvas = new LGraphCanvas(canvas, graph);

// Create nodes
const node1 = LiteGraph.createNode('math/number');
node1.pos = [100, 100];
graph.add(node1);

const node2 = LiteGraph.createNode('math/add');
node2.pos = [300, 100];
graph.add(node2);

// Connect nodes
node1.connect(0, node2, 0);

// Start execution
graph.start();
```

### Continuous Rendering

By default, the canvas only redraws when user interaction occurs (mouse movement, clicks, etc.). If you have nodes that update continuously (like a time node), you need to trigger redraws after each graph execution:

```javascript
// Redraw canvas after each graph step
graph.onAfterExecute = () => graphCanvas.draw(true);

graph.start();
```

### Registering Custom Nodes

Use ES6 class syntax extending `LGraphNode` (recommended):

```javascript
import LiteGraph, { LGraphNode } from 'litegraph-esm';
import 'litegraph-esm/css/litegraph.css';

// Define a custom node using ES6 class
class MultiplierNode extends LGraphNode {
    static title = 'Multiplier';
    static desc = 'Multiplies input by a constant';

    constructor() {
        super('Multiplier');
        this.addInput('in', 'number');
        this.addOutput('out', 'number');
        this.properties = { multiplier: 2 };
        this.size = [140, 60];
    }

    onExecute() {
        const input = this.getInputData(0) || 0;
        this.setOutputData(0, input * this.properties.multiplier);
    }
}

// Register the node type
LiteGraph.registerNodeType('math/multiplier', MultiplierNode);

// Create and use nodes
const node = LiteGraph.createNode('math/multiplier');
graph.add(node);
```

## API Reference

### Main Classes

- **LiteGraph** - Global namespace with configuration, constants, and utility methods
- **LGraph** - Graph container that holds nodes and manages execution
- **LGraphNode** - Base class for all nodes
- **LGraphCanvas** - Canvas renderer for displaying and interacting with graphs
- **LGraphGroup** - Visual grouping for nodes
- **LLink** - Represents a connection between node slots
- **DragAndScale** - Handles canvas panning and zooming
- **ContextMenu** - Right-click context menu component
- **CurveEditor** - Bezier curve editor widget

### Key Methods

```javascript
// Node registration
LiteGraph.registerNodeType(type, nodeClass);
LiteGraph.createNode(type);

// Graph operations
graph.add(node);
graph.remove(node);
graph.start();
graph.stop();
graph.runStep();

// Node connections
node.connect(outputSlot, targetNode, inputSlot);
node.disconnectOutput(slot);
node.disconnectInput(slot);

// Serialization
const data = graph.serialize();
graph.configure(data);
```

## TypeScript

Full TypeScript declarations are included. Import types directly:

```typescript
import type { LGraphNode, NodeSlot, NodeWidget } from 'litegraph-esm';
```

## Browser Support

This package uses ES6 features and requires a modern browser or bundler:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

## Credits

- Original library by [Javi Agenjo](https://github.com/jagenjo/litegraph.js)
- ES6 conversion by WebArcade Team

## License

MIT License - see LICENSE file for details.
