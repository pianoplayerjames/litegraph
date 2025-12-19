/**
 * ContextMenu - Creates right-click context menus with submenu support
 *
 * A modern ES6 implementation of the LiteGraph context menu system.
 * Provides a customizable dropdown menu with support for nested submenus,
 * separators, disabled items, and event-driven callbacks.
 *
 * @class ContextMenu
 */
class ContextMenu {
    /**
     * Static reference to LiteGraph - set externally to avoid circular dependencies
     * @type {object}
     */
    static LiteGraph = null;

    /**
     * Creates a new context menu
     *
     * @param {Array|Object} values - Menu items (array of items or object with key-value pairs)
     * @param {Object} [options={}] - Configuration options
     * @param {ContextMenu} [options.parentMenu] - Parent menu for submenus
     * @param {Event} [options.event] - Mouse/pointer event that triggered the menu
     * @param {string} [options.title] - Optional title for the menu
     * @param {string} [options.className] - Additional CSS class names
     * @param {Function} [options.callback] - Global callback for all menu items
     * @param {number} [options.left] - Left position in pixels
     * @param {number} [options.top] - Top position in pixels
     * @param {number} [options.scale] - Scale transformation
     * @param {number} [options.scroll_speed=0.1] - Mouse wheel scroll speed
     * @param {boolean} [options.autoopen] - Auto-open submenus on hover
     * @param {boolean} [options.ignore_item_callbacks] - Ignore individual item callbacks
     * @param {*} [options.extra] - Extra data passed to callbacks
     * @param {*} [options.node] - Node reference passed to callbacks
     */
    constructor(values, options = {}) {
        this.options = options;
        this.parentMenu = null;
        this.current_submenu = null;
        this.lock = false;
        this.root = null;

        const LG = ContextMenu.LiteGraph;
        if (!LG) {
            throw new Error('ContextMenu.LiteGraph must be set before creating instances');
        }

        // Link menu with its parent
        if (options.parentMenu) {
            if (options.parentMenu.constructor !== this.constructor) {
                console.error(
                    "parentMenu must be of class ContextMenu, ignoring it"
                );
                options.parentMenu = null;
            } else {
                this.parentMenu = options.parentMenu;
                this.parentMenu.lock = true;
                this.parentMenu.current_submenu = this;
            }
        }

        // Validate event type
        let eventClass = null;
        if (options.event) {
            // Use strings because comparing classes between windows doesn't work
            eventClass = options.event.constructor.name;
        }
        if (
            eventClass !== "MouseEvent" &&
            eventClass !== "CustomEvent" &&
            eventClass !== "PointerEvent"
        ) {
            console.error(
                `Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. (${eventClass})`
            );
            options.event = null;
        }

        // Create root element
        const root = document.createElement("div");
        root.className = "litegraph litecontextmenu litemenubar-panel";
        if (options.className) {
            root.className += " " + options.className;
        }
        root.style.minWidth = 100;
        root.style.minHeight = 100;
        root.style.pointerEvents = "none";
        setTimeout(() => {
            root.style.pointerEvents = "auto";
        }, 100); // Delay so the mouse up event is not caught by this element

        // Prevent default context browser menu
        LG.pointerListenerAdd(
            root,
            "up",
            (e) => {
                e.preventDefault();
                return true;
            },
            true
        );

        root.addEventListener(
            "contextmenu",
            (e) => {
                if (e.button != 2) {
                    // Right button
                    return false;
                }
                e.preventDefault();
                return false;
            },
            true
        );

        LG.pointerListenerAdd(
            root,
            "down",
            (e) => {
                if (e.button == 2) {
                    this.close();
                    e.preventDefault();
                    return true;
                }
            },
            true
        );

        // Set default scroll speed
        if (!options.scroll_speed) {
            options.scroll_speed = 0.1;
        }

        // Mouse wheel handling
        root.addEventListener("wheel", this._onMouseWheel.bind(this), true);
        root.addEventListener("mousewheel", this._onMouseWheel.bind(this), true);

        this.root = root;

        // Add title if provided
        if (options.title) {
            const element = document.createElement("div");
            element.className = "litemenu-title";
            element.innerHTML = options.title;
            root.appendChild(element);
        }

        // Add menu entries
        let num = 0;
        for (let i = 0; i < values.length; i++) {
            let name = values.constructor == Array ? values[i] : i;
            if (name != null && name.constructor !== String) {
                name = name.content === undefined ? String(name) : name.content;
            }
            const value = values[i];
            this.addItem(name, value, options);
            num++;
        }

        // Handle pointer enter to clear closing timer
        LG.pointerListenerAdd(root, "enter", (e) => {
            if (root.closing_timer) {
                clearTimeout(root.closing_timer);
            }
        });

        // Determine which document to append to
        let root_document = document;
        if (options.event) {
            root_document = options.event.target.ownerDocument;
        }

        if (!root_document) {
            root_document = document;
        }

        // Append to fullscreen element or body
        if (root_document.fullscreenElement) {
            root_document.fullscreenElement.appendChild(root);
        } else {
            root_document.body.appendChild(root);
        }

        // Compute best position
        let left = options.left || 0;
        let top = options.top || 0;
        if (options.event) {
            left = options.event.clientX - 10;
            top = options.event.clientY - 10;
            if (options.title) {
                top -= 20;
            }

            if (options.parentMenu) {
                const rect = options.parentMenu.root.getBoundingClientRect();
                left = rect.left + rect.width;
            }

            const body_rect = document.body.getBoundingClientRect();
            const root_rect = root.getBoundingClientRect();
            if (body_rect.height == 0) {
                console.error("document.body height is 0. That is dangerous, set html,body { height: 100%; }");
            }

            if (body_rect.width && left > body_rect.width - root_rect.width - 10) {
                left = body_rect.width - root_rect.width - 10;
            }
            if (body_rect.height && top > body_rect.height - root_rect.height - 10) {
                top = body_rect.height - root_rect.height - 10;
            }
        }

        root.style.left = left + "px";
        root.style.top = top + "px";

        if (options.scale) {
            root.style.transform = "scale(" + options.scale + ")";
        }
    }

    /**
     * Private method to handle mouse wheel scrolling
     * @private
     * @param {WheelEvent} e - Wheel event
     * @returns {boolean} True to indicate event was handled
     */
    _onMouseWheel(e) {
        const pos = parseInt(this.root.style.top);
        this.root.style.top =
            (pos + e.deltaY * this.options.scroll_speed).toFixed() + "px";
        e.preventDefault();
        return true;
    }

    /**
     * Adds a menu item to the context menu
     *
     * @param {string} name - Display name for the menu item
     * @param {*} value - Value associated with the item (can be a callback, object, or primitive)
     * @param {Object} options - Configuration options for the item
     * @returns {HTMLElement} The created menu item element
     */
    addItem(name, value, options = {}) {
        const LG = ContextMenu.LiteGraph;
        const element = document.createElement("div");
        element.className = "litemenu-entry submenu";

        let disabled = false;

        if (value === null) {
            element.classList.add("separator");
        } else {
            element.innerHTML = value && value.title ? value.title : name;
            element.value = value;

            if (value) {
                if (value.disabled) {
                    disabled = true;
                    element.classList.add("disabled");
                }
                if (value.submenu || value.has_submenu) {
                    element.classList.add("has_submenu");
                }
            }

            if (typeof value == "function") {
                element.dataset["value"] = name;
                element.onclick_callback = value;
            } else {
                element.dataset["value"] = value;
            }

            if (value.className) {
                element.className += " " + value.className;
            }
        }

        this.root.appendChild(element);

        if (!disabled) {
            element.addEventListener("click", this._createItemClickHandler(element, value, options));
        }
        if (!disabled && options.autoopen) {
            LG.pointerListenerAdd(element, "enter", this._createItemHoverHandler(element, value));
        }

        return element;
    }

    /**
     * Creates a hover handler for menu items (for autoopen submenus)
     * @private
     * @param {HTMLElement} element - The menu item element
     * @param {*} value - The item's value
     * @returns {Function} Event handler function
     */
    _createItemHoverHandler(element, value) {
        return (e) => {
            if (!value || !value.has_submenu) {
                return;
            }
            // If it is a submenu, autoopen like the item was clicked
            this._createItemClickHandler(element, value, this.options).call(element, e);
        };
    }

    /**
     * Creates a click handler for menu items
     * @private
     * @param {HTMLElement} element - The menu item element
     * @param {*} value - The item's value
     * @param {Object} options - Menu options
     * @returns {Function} Event handler function
     */
    _createItemClickHandler(element, value, options) {
        return (e) => {
            let close_parent = true;

            if (this.current_submenu) {
                this.current_submenu.close(e);
            }

            // Global callback
            if (options.callback) {
                const r = options.callback.call(
                    element,
                    value,
                    options,
                    e,
                    this,
                    options.node
                );
                if (r === true) {
                    close_parent = false;
                }
            }

            // Special cases
            if (value) {
                if (
                    value.callback &&
                    !options.ignore_item_callbacks &&
                    value.disabled !== true
                ) {
                    // Item callback
                    const r = value.callback.call(
                        element,
                        value,
                        options,
                        e,
                        this,
                        options.extra
                    );
                    if (r === true) {
                        close_parent = false;
                    }
                }
                if (value.submenu) {
                    if (!value.submenu.options) {
                        throw "ContextMenu submenu needs options";
                    }
                    const submenu = new this.constructor(value.submenu.options, {
                        callback: value.submenu.callback,
                        event: e,
                        parentMenu: this,
                        ignore_item_callbacks: value.submenu.ignore_item_callbacks,
                        title: value.submenu.title,
                        extra: value.submenu.extra,
                        autoopen: options.autoopen
                    });
                    close_parent = false;
                }
            }

            if (close_parent && !this.lock) {
                this.close();
            }
        };
    }

    /**
     * Closes the context menu and optionally its parent menu
     *
     * @param {Event} [e] - Optional event object
     * @param {boolean} [ignore_parent_menu=false] - If true, don't close parent menu
     */
    close(e, ignore_parent_menu = false) {
        const LG = ContextMenu.LiteGraph;

        if (this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }

        if (this.parentMenu && !ignore_parent_menu) {
            this.parentMenu.lock = false;
            this.parentMenu.current_submenu = null;
            if (e === undefined) {
                this.parentMenu.close();
            } else if (
                e &&
                !ContextMenu.isCursorOverElement(e, this.parentMenu.root)
            ) {
                ContextMenu.trigger(
                    this.parentMenu.root,
                    LG.pointerevents_method + "leave",
                    e
                );
            }
        }

        if (this.current_submenu) {
            this.current_submenu.close(e, true);
        }

        if (this.root.closing_timer) {
            clearTimeout(this.root.closing_timer);
        }

        // TODO implement: LiteGraph.contextMenuClosed(); :: keep track of opened/closed/current ContextMenu
        // on key press, allow filtering/selecting the context menu elements
    }

    /**
     * Returns the top-most menu in the hierarchy
     *
     * @returns {ContextMenu} The root menu
     */
    getTopMenu() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getTopMenu();
        }
        return this;
    }

    /**
     * Returns the event that triggered the top-most menu
     *
     * @returns {Event} The original event
     */
    getFirstEvent() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getFirstEvent();
        }
        return this.options.event;
    }

    /**
     * Triggers a custom event on an element
     *
     * @static
     * @param {HTMLElement} element - Target element
     * @param {string} event_name - Name of the event to trigger
     * @param {*} params - Event parameters
     * @param {HTMLElement} [origin] - Source element of the event
     * @returns {CustomEvent} The created and dispatched event
     */
    static trigger(element, event_name, params, origin) {
        const evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event_name, true, true, params); // canBubble, cancelable, detail
        evt.srcElement = origin;
        if (element.dispatchEvent) {
            element.dispatchEvent(evt);
        } else if (element.__events) {
            element.__events.dispatchEvent(evt);
        }
        // else nothing seems bound here so nothing to do
        return evt;
    }

    /**
     * Checks if the cursor is over a given element
     *
     * @static
     * @param {Event} event - Event containing cursor position
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if cursor is over the element
     */
    static isCursorOverElement(event, element) {
        const left = event.clientX;
        const top = event.clientY;
        const rect = element.getBoundingClientRect();
        if (!rect) {
            return false;
        }
        if (
            top > rect.top &&
            top < rect.top + rect.height &&
            left > rect.left &&
            left < rect.left + rect.width
        ) {
            return true;
        }
        return false;
    }
}

// Default export
export default ContextMenu;

// Named export
export { ContextMenu };
