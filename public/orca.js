"use strict";
// Utility to get an element by ID, throws an error if not found
const getElementById = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Unable to find the element with ID "${elementId}"`);
    }
    return element;
};
// Utility to show an element, accepts either an element ID or an HTMLElement
const show = (element) => {
    if (isString(element)) {
        element = getElementById(element);
    }
    element.style.display = "block";
};
// Utility to hide an element, accepts either an element ID or an HTMLElement
const hide = (element) => {
    if (isString(element)) {
        element = getElementById(element);
    }
    element.style.display = "none";
};
// Utility to check if a value is a string
const isString = (value) => typeof value === "string" || value instanceof String;
// Dialog class for managing dialog elements
class Dialog {
    static open(elementId) {
        show(elementId);
    }
    static close(elementId) {
        hide(elementId);
    }
}
