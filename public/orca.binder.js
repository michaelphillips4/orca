"use strict";
class Binder {
    constructor(appId, model, modelChangedCallback) {
        this.items = [];
        this.inputTypes = ["INPUT", "TEXTAREA", "SELECT"];
        this.tickable = ["checkbox", "radio"];
        this.model = model;
        this.modelChangedCallback = modelChangedCallback;
        const appElement = document.getElementById(appId);
        if (!appElement) {
            throw new Error(`No element with the appId found: ${appId}`);
        }
        this.app = appElement;
        this.load();
    }
    load() {
        const elements = this.app.querySelectorAll("[data-bind]");
        elements.forEach((element) => {
            const key = element.getAttribute("data-bind");
            if (key) {
                this.addElement(element, key, this.model);
            }
        });
    }
    addElement(element, key, model) {
        this.items.push(element);
        this.updateElementValue(element, model[key]);
        if (this.inputTypes.includes(element.tagName)) {
            const inputElement = element;
            if (this.tickable.includes(inputElement.type)) {
                inputElement.addEventListener("change", (e) => this.tickableElementChangeHandler(e));
            }
            else {
                inputElement.addEventListener("input", () => this.inputHandler(inputElement, key));
            }
        }
    }
    tickableElementChangeHandler(event) {
        var _a, _b;
        const target = event.target;
        const key = target.getAttribute("data-bind");
        if (!key)
            return;
        const value = (_b = (_a = document.querySelector(`[data-bind="${key}"]:checked`)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
        this.model[key] = value;
        this.modelValueChangedHandler(key, value);
    }
    inputHandler(element, key) {
        var _a;
        const value = (_a = element.value) !== null && _a !== void 0 ? _a : "";
        this.model[key] = value;
        this.modelValueChangedHandler(key, value);
    }
    modelValueChangedHandler(property, value) {
        const toChange = this.items.filter((v) => v.getAttribute("data-bind") === property);
        toChange.forEach((e) => {
            const element = e;
            if (this.tickable.includes(element.type)) {
                if (element.value === value) {
                    element.checked = true;
                }
            }
            else {
                this.updateElementValue(e, value);
            }
        });
        this.modelChangedCallback(property, value);
    }
    updateElementValue(element, value) {
        if (value === undefined)
            return;
        if (this.inputTypes.includes(element.tagName)) {
            const inputElement = element;
            if (this.tickable.includes(inputElement.type)) {
                inputElement.checked = Boolean(value);
            }
            else {
                inputElement.value = value;
            }
        }
        else {
            element.textContent = value;
        }
    }
}
