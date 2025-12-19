import { LiteGraphStatic } from './LiteGraph';

export interface ContextMenuOptions {
    callback?: (value: any, options: any, event: MouseEvent, parent_menu: ContextMenu, node?: any) => boolean | void;
    ignore_item_callbacks?: boolean;
    event?: MouseEvent;
    parentMenu?: ContextMenu;
    title?: string;
    autoopen?: boolean;
    extra?: any;
    node?: any;
    className?: string;
    scroll_speed?: number;
}

export interface ContextMenuItem {
    content: string;
    callback?: (value: any, options: any, event: MouseEvent, parent_menu: ContextMenu, node?: any) => boolean | void;
    submenu?: { options: ContextMenuItem[] };
    has_submenu?: boolean;
    disabled?: boolean;
    className?: string;
    title?: string;
}

/**
 * ContextMenu - Right-click context menu
 */
export class ContextMenu {
    static LiteGraph: LiteGraphStatic;
    static trigger(element: HTMLElement, event_name: string, params?: any, origin?: any): void;
    static isCursorOverElement(event: MouseEvent, element: HTMLElement): boolean;
    static closeAllContextMenus(ref_window?: Window): void;

    options: ContextMenuItem[];
    parentMenu: ContextMenu | null;
    root: HTMLElement;
    current_submenu: ContextMenu | null;
    lock: boolean;

    constructor(values: ContextMenuItem[], options?: ContextMenuOptions, window?: Window);

    setTitle(title: string): void;
    addItem(name: string, value: any, options?: any): HTMLElement;
    close(e?: MouseEvent, ignore_parent_menu?: boolean): void;
    getTopMenu(): ContextMenu;
    getFirstEvent(): MouseEvent | null;
}

export default ContextMenu;
