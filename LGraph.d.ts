import { LiteGraphStatic } from './LiteGraph';
import { LGraphNode } from './LGraphNode';
import { LGraphGroup } from './LGraphGroup';
import { LLink } from './LLink';

export interface SerializedGraph {
    last_node_id: number;
    last_link_id: number;
    nodes: any[];
    links: any[];
    groups?: any[];
    config?: Record<string, any>;
    extra?: Record<string, any>;
    version?: number;
}

export interface GraphConfig {
    align_to_grid?: boolean;
    links_ontop?: boolean;
}

/**
 * LGraph - A graph that contains nodes and handles their execution
 */
export class LGraph {
    static LiteGraph: LiteGraphStatic;
    static LGraphCanvas: any;
    static LGraphNode: typeof LGraphNode;
    static LGraphGroup: typeof LGraphGroup;
    static LLink: typeof LLink;
    static STATUS_STOPPED: number;
    static STATUS_RUNNING: number;
    static supported_types: string[];

    // Instance properties
    list_of_graphcanvas: any[] | null;
    status: number;
    last_node_id: number;
    last_link_id: number;
    _nodes: LGraphNode[];
    _nodes_by_id: Record<number, LGraphNode>;
    _nodes_in_order: LGraphNode[];
    _nodes_executable: LGraphNode[] | null;
    _groups: LGraphGroup[];
    links: Record<number, LLink>;
    iteration: number;
    globaltime: number;
    runningtime: number;
    fixedtime: number;
    fixedtime_lapse: number;
    elapsed_time: number;
    last_update_time: number;
    starttime: number;
    catch_errors: boolean;
    execution_timer_id: number | null;
    execution_time: number;
    errors_in_execution: boolean;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    config: GraphConfig;
    extra: Record<string, any>;
    supported_types?: string[];

    constructor(o?: any);

    getSupportedTypes(): string[];
    clear(): void;
    attachCanvas(graphcanvas: any): void;
    detachCanvas(graphcanvas: any): void;
    start(interval?: number): void;
    stop(): void;
    runStep(num?: number, do_not_catch_errors?: boolean, limit?: number): void;
    updateExecutionOrder(): void;
    computeExecutionOrder(only_onExecute?: boolean, set_level?: boolean): LGraphNode[];
    getAncestors(node: LGraphNode): LGraphNode[];
    add(node: LGraphNode | LGraphGroup, skip_compute_order?: boolean): LGraphNode | LGraphGroup | null;
    remove(node: LGraphNode | LGraphGroup): void;
    getNodeById(id: number): LGraphNode | null;
    findNodesByClass<T extends LGraphNode>(classObject: new () => T, result?: T[]): T[];
    findNodesByType(type: string, result?: LGraphNode[]): LGraphNode[];
    findNodesByTitle(title: string): LGraphNode[];
    findNodeByTitle(title: string): LGraphNode | null;
    getNodeOnPos(x: number, y: number, nodes_list?: LGraphNode[], margin?: number): LGraphNode | null;
    getGroupOnPos(x: number, y: number): LGraphGroup | null;
    serialize(): SerializedGraph;
    configure(data: SerializedGraph, keep_old?: boolean): boolean;
    load(url: string, callback?: (data: any) => void): void;
    onNodeTrace?(node: LGraphNode, msg: string, color?: string): void;
    onPlayEvent?(): void;
    onStopEvent?(): void;
    onNodeAdded?(node: LGraphNode): void;
    onNodeRemoved?(node: LGraphNode): void;
    onNodeConnectionChange?(connection_type: number, node: LGraphNode, slot_index: number, target_node?: LGraphNode, target_slot?: number): void;
    onTrigger?(action: string, param: any): void;
    onInputAdded?(name: string, type: string): void;
    onInputRenamed?(old_name: string, new_name: string): void;
    onInputTypeChanged?(name: string, type: string): void;
    onInputRemoved?(name: string): void;
    onOutputAdded?(name: string, type: string): void;
    onOutputRenamed?(old_name: string, new_name: string): void;
    onOutputTypeChanged?(name: string, type: string): void;
    onOutputRemoved?(name: string): void;
    onBeforeChange?(info?: any): void;
    onAfterChange?(info?: any): void;
    onBeforeStep?(): void;
    onAfterStep?(): void;
    onExecuteStep?(): void;
    onAfterExecute?(): void;
    onSerialize?(data: SerializedGraph): void;
    onConfigure?(data: SerializedGraph): void;
    onGetNodeMenuOptions?(options: any[], node: LGraphNode): void;
    onNodeConnectionChange?(connection_type: number, slot: number, connected: boolean, link_info: LLink, input_info: any): void;
    sendEventToAllNodes(eventname: string, param?: any, mode?: number): void;
    sendActionToCanvas(action: string, params?: any[]): void;
    getElapsedTime(): number;
    getFixedTime(): number;
    getTime(): number;
    isLive(): boolean;
    change(): void;
    setDirtyCanvas(foreground: boolean, background?: boolean): void;
    getTopLeftNode(): number[];
    addInput(name: string, type: string, value?: any): void;
    removeInput(name: string): boolean;
    renameInput(old_name: string, name: string): boolean;
    changeInputType(name: string, type: string): boolean;
    addOutput(name: string, type: string, value?: any): void;
    removeOutput(name: string): boolean;
    renameOutput(old_name: string, name: string): boolean;
    changeOutputType(name: string, type: string): boolean;
    getInputData(name: string): any;
    setInputData(name: string, data: any): void;
    setOutputData(name: string, value: any): void;
    getOutputData(name: string): any;
    triggerInput(name: string, value?: any): void;
    setCallback(name: string, func: Function): void;
    arrangeNodes(margin?: number, layout?: string): void;
}

export default LGraph;
