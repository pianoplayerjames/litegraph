import { LiteGraphStatic } from './LiteGraph';
import { LGraph } from './LGraph';
import { LLink } from './LLink';

export interface NodeSlot {
    name: string;
    type: string | number;
    link?: number | null;
    links?: number[] | null;
    label?: string;
    dir?: number;
    pos?: number[];
    color_on?: string;
    color_off?: string;
    shape?: number;
    slot_index?: number;
    locked?: boolean;
    nameLocked?: boolean;
}

export interface NodeWidget {
    name: string;
    type: string;
    value: any;
    options?: Record<string, any>;
    callback?: (value: any, graphCanvas?: any, node?: LGraphNode, pos?: number[], event?: any) => void;
    y?: number;
    last_y?: number;
    disabled?: boolean;
    hidden?: boolean;
}

export interface SerializedNode {
    id: number;
    type: string;
    pos: number[];
    size: number[];
    flags?: Record<string, any>;
    order?: number;
    mode?: number;
    outputs?: NodeSlot[];
    inputs?: NodeSlot[];
    title?: string;
    properties?: Record<string, any>;
    widgets_values?: any[];
    color?: string;
    bgcolor?: string;
    boxcolor?: string;
    shape?: number;
}

/**
 * LGraphNode - Base class for graph nodes
 */
export class LGraphNode {
    static LiteGraph: LiteGraphStatic;
    static title: string;
    static desc: string;
    static type: string;
    static category: string;
    static supported_extensions: string[];
    static skip_list: boolean;
    static widgets_info: Record<string, any>;
    static title_mode: number;
    static collapsible: boolean;
    static pinned: boolean;
    static resizable: boolean;
    static slot_start_y: number;

    // Instance properties
    id: number;
    type: string | null;
    title: string;
    desc: string;
    pos: number[];
    size: number[];
    graph: LGraph | null;
    inputs: NodeSlot[];
    outputs: NodeSlot[];
    connections: any[];
    properties: Record<string, any>;
    properties_info: any[];
    widgets: NodeWidget[];
    widgets_values?: any[];
    widgets_up?: boolean;
    widgets_start_y?: number;
    flags: Record<string, any>;
    color: string;
    bgcolor: string;
    boxcolor: string;
    shape: number;
    horizontal: boolean;
    serialize_widgets: boolean;
    skip_list: boolean;
    is_selected: boolean;
    mouseOver: boolean;
    order: number;
    mode: number;
    last_serialization: SerializedNode | null;
    execution_time: number;
    redraw_on_mouse: boolean;
    ignore_remove: boolean;
    block_delete: boolean;
    resizable: boolean;
    clip_area: boolean;
    min_size: number[];
    max_size: number[];
    collapsed: boolean;
    pinned: boolean;

    constructor(title?: string);

    configure(info: SerializedNode): void;
    serialize(): SerializedNode;
    clone(): LGraphNode;
    toString(): string;
    getTitle(): string;
    setProperty(name: string, value: any): void;
    setPropertyDefaultValue(name: string, value: any): void;
    getMenuOptions(graphcanvas: any): any[];
    getExtraMenuOptions(graphcanvas: any, options: any[]): any[];
    getPropertyInfo(property: string): any;
    addInput(name: string, type: string | number, extra_info?: any): NodeSlot;
    addOutput(name: string, type: string | number, extra_info?: any): NodeSlot;
    addProperty(name: string, default_value: any, type?: string, extra_info?: any): any;
    addWidget(type: string, name: string, value: any, callback?: Function | string, options?: any): NodeWidget;
    removeInput(slot: number): void;
    removeOutput(slot: number): void;
    addConnection(name: string, type: string, pos: number[], direction: string): any;
    setOutputData(slot: number, data: any): void;
    setOutputDataType(slot: number, type: string): void;
    getInputData(slot: number, force_update?: boolean): any;
    getInputDataType(slot: number): string;
    getInputDataByName(slot_name: string, force_update?: boolean): any;
    isInputConnected(slot: number): boolean;
    getInputInfo(slot: number): NodeSlot | null;
    getOutputInfo(slot: number): NodeSlot | null;
    getInputLink(slot: number): LLink | null;
    getOutputLinks(slot: number): LLink[];
    getInputNode(slot: number): LGraphNode | null;
    getOutputNodes(slot: number): LGraphNode[];
    isOutputConnected(slot: number): boolean;
    isAnyOutputConnected(): boolean;
    isAnyInputConnected(): boolean;
    getInputOrProperty(name: string): any;
    setSize(size: number[]): void;
    setPos(pos: number[]): void;
    getConnectionPos(is_input: boolean, slot_index: number, out?: number[]): number[];
    alignToGrid(): void;
    connect(slot: number, target_node: LGraphNode | number, target_slot?: number | string): LLink | null;
    disconnectOutput(slot: number | string, target_node?: LGraphNode): boolean;
    disconnectInput(slot: number | string): boolean;
    getSlotInPosition(x: number, y: number): { input?: NodeSlot, slot?: number, link_pos?: number[], output?: NodeSlot } | null;
    findInputSlot(name: string, returnObj?: boolean): number | NodeSlot;
    findOutputSlot(name: string, returnObj?: boolean): number | NodeSlot;
    findInputSlotFree(optsIn?: any): number;
    findOutputSlotFree(optsIn?: any): number;
    findSlotByType(is_input: boolean, type: string, returnObj?: boolean, preferFreeSlot?: boolean, doNotUseStarType?: boolean): number | NodeSlot;
    connectByType(slot: number, target_node: LGraphNode, target_slotType: string, optsIn?: any): LLink | null;
    connectByTypeOutput(slot: number, source_node: LGraphNode, source_slotType: string, optsIn?: any): LLink | null;
    collapse(force?: boolean): void;
    pin(v?: boolean): void;
    localToScreen(x: number, y: number, graphcanvas?: any): number[];
    bypass(v?: boolean): void;
    setMode(mode: number): void;
    trigger(action: string, param?: any, options?: any): void;
    triggerSlot(slot: number, param?: any, link_id?: number): void;

    // Callbacks - override these
    onAdded?(graph: LGraph): void;
    onRemoved?(): void;
    onStart?(): void;
    onStop?(): void;
    onDrawBackground?(ctx: CanvasRenderingContext2D, graphcanvas: any, canvas: HTMLCanvasElement, pos: number[]): void;
    onDrawForeground?(ctx: CanvasRenderingContext2D, graphcanvas: any, canvas: HTMLCanvasElement): void;
    onDrawCollapsed?(ctx: CanvasRenderingContext2D, graphcanvas: any): void;
    onMouseDown?(event: MouseEvent, pos: number[], graphcanvas: any): boolean | void;
    onMouseMove?(event: MouseEvent, pos: number[], graphcanvas: any): boolean | void;
    onMouseUp?(event: MouseEvent, pos: number[], graphcanvas: any): boolean | void;
    onMouseEnter?(event: MouseEvent, pos: number[], graphcanvas: any): void;
    onMouseLeave?(event: MouseEvent, pos: number[], graphcanvas: any): void;
    onDblClick?(event: MouseEvent, pos: number[], graphcanvas: any): void;
    onKey?(event: KeyboardEvent, pos: number[], graphcanvas: any): boolean | void;
    onKeyDown?(event: KeyboardEvent, pos: number[], graphcanvas: any): boolean | void;
    onKeyUp?(event: KeyboardEvent, pos: number[], graphcanvas: any): boolean | void;
    onExecute?(param?: any, options?: any): void;
    onAction?(action: string, param?: any, options?: any): void;
    onGetInputs?(): Array<[string, string | number, any?]>;
    onGetOutputs?(): Array<[string, string | number, any?]>;
    onSerialize?(o: SerializedNode): void;
    onConfigure?(o: SerializedNode): void;
    onPropertyChanged?(name: string, value: any, prev_value?: any): boolean | void;
    onWidgetChanged?(name: string, value: any, old_value: any, widget: NodeWidget): void;
    onConnectionsChange?(type: number, slot_index: number, connected: boolean, link_info: LLink, input_info: NodeSlot): void;
    onConnectInput?(slot_index: number, type: string, output: NodeSlot, node: LGraphNode, output_slot: number): boolean;
    onConnectOutput?(slot_index: number, type: string, input: NodeSlot, node: LGraphNode, input_slot: number): boolean;
    onResize?(size: number[]): void;
    onDropItem?(event: DragEvent): boolean | void;
    onDropFile?(file: File): boolean | void;
    getSlotMenuOptions?(slot: { input?: NodeSlot, output?: NodeSlot, slot?: number, link_pos?: number[] }): any[];
    computeSize?(out?: number[]): number[];
}

export default LGraphNode;
