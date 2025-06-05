// Utility to get an element by ID, throws an error if not found
const getElementById = (elementId: string): HTMLElement => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Unable to find the element with ID "${elementId}"`);
  }

  return element;
};

// Utility to show an element, accepts either an element ID or an HTMLElement
const show = (element: string | HTMLElement): void => {
  if (isString(element)) {
    element = getElementById(element);
  }

  (element as HTMLElement).style.display = "block";
};

// Utility to hide an element, accepts either an element ID or an HTMLElement
const hide = (element: string | HTMLElement): void => {
  if (isString(element)) {
    element = getElementById(element);
  }

  (element as HTMLElement).style.display = "none";
};

// Utility to check if a value is a string
const isString = (value: unknown): value is string => 
  typeof value === "string" || value instanceof String;

// Dialog class for managing dialog elements
class Dialog {
  static open(elementId: string): void {
   document.body.style.opacity = '0.5';
   const dialog = getElementById(elementId) as HTMLDialogElement;
   dialog.showModal();
  }

  static close(elementId: string): void {
     document.body.style.opacity = '1';
   const dialog = getElementById(elementId) as HTMLDialogElement;
   dialog.close();
  }
}
