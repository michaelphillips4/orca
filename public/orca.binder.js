"use strict";
class Binder {
    constructor(containerSelector) {
        this.model = {};
        this.bindings = {};
        this.changeCallbacks = {};
        this.globalChangeCallback = null;
        this.templateBindings = [];
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container with selector "${containerSelector}" not found.`);
        }
        this.container = container;
        this.initBindings();
        this.scanTemplates();
    }
    // Initialize bindings by scanning the container
    initBindings() {
        this.container
            .querySelectorAll("[data-bind]")
            .forEach((element) => {
            const key = element.getAttribute("data-bind");
            if (!key)
                return;
            this.bindings[key] = this.bindings[key] || [];
            if (element) {
                const formElement = element;
                if (formElement.type === "radio") {
                    formElement.addEventListener("change", (event) => {
                        const target = event.target;
                        if (target.checked) {
                            this.updateModel(key, target.value);
                        }
                    });
                }
                else if (formElement.type === "checkbox") {
                    formElement.addEventListener("change", (event) => {
                        const checkboxes = this.container.querySelectorAll(`[data-bind="${key}"]`);
                        if (checkboxes.length > 1) {
                            // Handle grouped checkboxes
                            const values = Array.from(checkboxes)
                                .filter((cb) => cb.checked)
                                .map((cb) => cb.value);
                            this.updateModel(key, values);
                        }
                        else {
                            // Handle a single checkbox
                            const target = event.target;
                            if (target.checked) {
                                this.updateModel(key, target.checked);
                            }
                        }
                    });
                }
                else if (formElement.type === "range") {
                    formElement.addEventListener("input", (event) => {
                        const target = event.target;
                        this.updateModel(key, target.value);
                    });
                }
                else {
                    formElement.addEventListener("input", (event) => {
                        const target = event.target;
                        this.updateModel(key, target.value);
                    });
                    formElement.addEventListener("change", (event) => {
                        const target = event.target;
                        this.updateModel(key, target.value);
                    });
                }
                this.bindings[key].push(formElement);
            }
        });
        // Bind display elements
        this.container.querySelectorAll("[data-display]").forEach((element) => {
            const key = element.getAttribute("data-display");
            if (!key)
                return;
            this.bindings[key] = this.bindings[key] || [];
            this.bindings[key].push(element);
        });
    }
    // Scan the container for template bindings like {{fieldName}}
    scanTemplates() {
        var _a;
        const walker = document.createTreeWalker(this.container, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const matches = (_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.match(/{{\s*([\w]+)\s*}}/g);
            if (matches) {
                matches.forEach((match) => {
                    var _a;
                    const key = match.replace(/{{\s*|\s*}}/g, ""); // Extract key from {{key}}
                    this.templateBindings.push({
                        node,
                        key,
                        template: node.nodeValue,
                    });
                    // Replace {{fieldName}} tokens with an empty string initially
                    node.nodeValue = ((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.replace(match, "")) || "";
                });
            }
        }
    }
    // Register a callback for when a specific model key changes
    onFieldChanged(key, callback) {
        this.changeCallbacks[key] = callback;
    }
    // Register a global callback for any model value change
    onAnyFieldChanged(callback) {
        this.globalChangeCallback = callback;
    }
    // Update the model and all bound elements
    updateModel(key, value) {
        this.model[key] = value;
        this.updateBindings(key);
        // Trigger specific field callback if it exists
        if (this.changeCallbacks[key]) {
            this.changeCallbacks[key](value);
        }
        // Trigger global callback if it exists
        if (this.globalChangeCallback) {
            this.globalChangeCallback(key, value);
        }
        // Update template bindings
        this.updateTemplateBindings();
    }
    // Update all bound elements for a given key
    updateBindings(key) {
        if (this.bindings[key]) {
            this.bindings[key].forEach((element) => {
                if (element instanceof HTMLFormElement) {
                    if (element.type === "radio" || element.type === "checkbox") {
                        element.checked = Array.isArray(this.model[key])
                            ? this.model[key].includes(element.value)
                            : this.model[key] === element.value || this.model[key] === true;
                    }
                    else {
                        element.value = this.model[key].value;
                    }
                }
                else {
                    element.textContent = this.model[key];
                }
            });
        }
    }
    // Update all template bindings
    updateTemplateBindings() {
        this.templateBindings.forEach(({ node, key, template }) => {
            if (this.model[key] !== undefined) {
                node.nodeValue = template.replace(/{{\s*([\w]+)\s*}}/g, (_, field) => {
                    return this.model[field] !== undefined ? this.model[field] : "";
                });
            }
        });
    }
}
