/**
 * LiteGraph namespace - contains all configuration, constants, and utility methods
 */
export interface LiteGraphStatic {
    // Version
    VERSION: number;

    // Canvas constants
    CANVAS_GRID_SIZE: number;

    // Node visual constants
    NODE_TITLE_HEIGHT: number;
    NODE_TITLE_TEXT_Y: number;
    NODE_SLOT_HEIGHT: number;
    NODE_WIDGET_HEIGHT: number;
    NODE_WIDTH: number;
    NODE_MIN_WIDTH: number;
    NODE_COLLAPSED_RADIUS: number;
    NODE_COLLAPSED_WIDTH: number;
    NODE_TITLE_COLOR: string;
    NODE_SELECTED_TITLE_COLOR: string;
    NODE_TEXT_SIZE: number;
    NODE_TEXT_COLOR: string;
    NODE_SUBTEXT_SIZE: number;
    NODE_DEFAULT_COLOR: string;
    NODE_DEFAULT_BGCOLOR: string;
    NODE_DEFAULT_BOXCOLOR: string;
    NODE_DEFAULT_SHAPE: string;
    NODE_BOX_OUTLINE_COLOR: string;
    DEFAULT_SHADOW_COLOR: string;
    DEFAULT_GROUP_FONT: number;

    // Widget colors
    WIDGET_BGCOLOR: string;
    WIDGET_OUTLINE_COLOR: string;
    WIDGET_TEXT_COLOR: string;
    WIDGET_SECONDARY_TEXT_COLOR: string;

    // Link colors
    LINK_COLOR: string;
    EVENT_LINK_COLOR: string;
    CONNECTING_LINK_COLOR: string;

    // Limits
    MAX_NUMBER_OF_NODES: number;
    DEFAULT_POSITION: number[];
    VALID_SHAPES: string[];

    // Slot and link types
    INPUT: number;
    OUTPUT: number;
    EVENT: number;
    ACTION: number;
    ALWAYS: number;
    ON_EVENT: number;
    NEVER: number;
    ON_TRIGGER: number;
    UP: number;
    DOWN: number;
    LEFT: number;
    RIGHT: number;
    CENTER: number;

    // Link render modes
    LINK_RENDER_MODES: string[];
    STRAIGHT_LINK: number;
    LINEAR_LINK: number;
    SPLINE_LINK: number;

    // Node modes
    NORMAL_TITLE: number;
    NO_TITLE: number;
    TRANSPARENT_TITLE: number;
    AUTOHIDE_TITLE: number;
    VERTICAL_LAYOUT: string;

    // Behavior flags
    proxy: any;
    node_images_path: string;
    debug: boolean;
    catch_exceptions: boolean;
    throw_errors: boolean;
    allow_scripts: boolean;
    registered_node_types: Record<string, any>;
    node_types_by_file_extension: Record<string, any>;
    Nodes: Record<string, any>;
    Globals: Record<string, any>;
    searchbox_extras: Record<string, any>;
    auto_sort_node_types: boolean;
    node_box_coloured_when_on: boolean;
    node_box_coloured_by_mode: boolean;
    dialog_close_on_mouse_leave: boolean;
    dialog_close_on_mouse_leave_delay: number;
    shift_click_do_break_link_from: boolean;
    click_do_break_link_to: boolean;
    search_hide_on_mouse_leave: boolean;
    search_filter_enabled: boolean;
    search_show_all_on_open: boolean;
    auto_load_slot_types: boolean;
    registered_slot_in_types: Record<string, any>;
    registered_slot_out_types: Record<string, any>;
    slot_types_in: string[];
    slot_types_out: string[];
    slot_types_default_in: any[];
    slot_types_default_out: any[];
    alt_drag_do_clone_nodes: boolean;
    do_add_triggers_slots: boolean;
    allow_multi_output_for_events: boolean;
    middle_click_slot_add_default_node: boolean;
    release_link_on_empty_shows_menu: boolean;
    pointerevents_method: string;
    ctrl_shift_v_paste_connect_unselected_outputs: boolean;
    backspace_delete: boolean;
    actionHistory_enabled: boolean;
    actionHistoryMaxSave: number;
    showCanvasOptions: boolean;
    use_uuids: boolean;

    // Class references (set by index.js)
    LGraph: any;
    LGraphNode: any;
    LGraphCanvas: any;
    LGraphGroup: any;
    LLink: any;
    DragAndScale: any;
    ContextMenu: any;
    CurveEditor: any;

    // Methods
    registerNodeType(type: string, base_class: any): void;
    unregisterNodeType(type: string): void;
    wrapFunctionAsNode(name: string, func: Function, param_types?: string[], return_type?: string, properties?: any): void;
    registerSlotTypeColor(type: string, color: string): void;
    createNode(type: string): any;
    getNodeType(type: string): any;
    getNodeTypesCategories(filter?: string): string[];
    getNodeTypesInCategory(category: string, filter?: string): any[];
    getNodeTypesInAllCategories(filter?: string): Record<string, any[]>;
    reloadNodes(folder_wildcard?: string): void;
    clearRegisteredTypes(): void;
    getTime(): number;
    closeAllContextMenus(ref_window?: Window): void;
    extendClass<T, U>(target: T, origin: U): T & U;
    cloneObject<T>(obj: T): T;
    isValidConnection(type_a: string, type_b: string): boolean;
    compareObjects(a: any, b: any): boolean;
    distance(a: number[], b: number[]): number;
    colorToString(c: number[]): string;
    hexToColor(hex: string): number[];
    computeTextWidth(text: string, fontSize?: number): number;
}

export const LiteGraph: LiteGraphStatic;
export default LiteGraph;

export function clamp(v: number, a: number, b: number): number;
