type ChangeCallback = (newValue: any) => void;
type GlobalChangeCallback = (key: string, value: any) => void;


interface TemplateBinding {
  node: Text;
  key: string;
  template: string;
}

class Binder {
  private container: HTMLElement;
  private model: Record<string, any> = {};
  private bindings: Record<string, HTMLElement[]> = {};
  private changeCallbacks: Record<string, ChangeCallback> = {};
  private globalChangeCallback: GlobalChangeCallback | null = null;
  private templateBindings: TemplateBinding[] = [];

  constructor(containerSelector: string) {
    const container = document.querySelector(containerSelector);

    if (!container) {
      throw new Error(
        `Container with selector "${containerSelector}" not found.`
      );
    }

    this.container = container as HTMLElement;
    this.initBindings();
    this.scanTemplates();
  }

  // Initialize bindings by scanning the container
  private initBindings(): void {
    this.container
      .querySelectorAll("[data-bind]")

      .forEach((element: Element) => {

        const key = element.getAttribute("data-bind");

        if (!key) return;

        this.bindings[key] = this.bindings[key] || [];

        if (element) {

          const formElement = element as HTMLFormElement;

          if (formElement.type === "radio") {
            formElement.addEventListener("change", (event: Event) => {
              const target = event.target as HTMLInputElement;
              if (target.checked) {
                this.updateModel(key, target.value);
              }
            });
          } else if (formElement.type === "checkbox") {
            formElement.addEventListener("change", (event: Event) => {
              const checkboxes = this.container.querySelectorAll(
                `[data-bind="${key}"]`
              ) as NodeListOf<HTMLInputElement>;
              if (checkboxes.length > 1) {
                // Handle grouped checkboxes
                const values = Array.from(checkboxes)
                  .filter((cb) => cb.checked)
                  .map((cb) => cb.value);
                this.updateModel(key, values);
              } else {
                // Handle a single checkbox
                const target = event.target as HTMLInputElement;
                if (target.checked) {
                  this.updateModel(key, target.checked);
                }
              }
            });
          } else if (formElement.type === "range") {
            formElement.addEventListener("input", (event: Event) => {
              const target = event.target as HTMLInputElement;
              this.updateModel(key, target.value);
            });
          } else {
            formElement.addEventListener("input", (event: Event) => {
              const target = event.target as HTMLInputElement;
              this.updateModel(key, target.value);
            });
            formElement.addEventListener("change", (event: Event) => {
              const target = event.target as HTMLInputElement;
              this.updateModel(key, target.value);
            });
          }
          this.bindings[key].push(formElement);
        }
      });

    // Bind display elements
    this.container.querySelectorAll("[data-display]").forEach((element) => {
      const key = element.getAttribute("data-display");
      if (!key) return;

      this.bindings[key] = this.bindings[key] || [];
      this.bindings[key].push(element as HTMLElement);
    });
  }

  // Scan the container for template bindings like {{fieldName}}
  private scanTemplates(): void {
    const walker = document.createTreeWalker(
      this.container,
      NodeFilter.SHOW_TEXT,
      null
    );
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const matches = node.nodeValue?.match(/{{\s*([\w]+)\s*}}/g);

      if (matches) {
        matches.forEach((match) => {
          const key = match.replace(/{{\s*|\s*}}/g, ""); // Extract key from {{key}}
          this.templateBindings.push({
            node,
            key,
            template: node.nodeValue as string,
          });

          // Replace {{fieldName}} tokens with an empty string initially
          node.nodeValue = node.nodeValue?.replace(match, "") || "";
        });
      }
    }
  }

  // Register a callback for when a specific model key changes
  public onFieldChanged(key: string, callback: ChangeCallback): void {
    this.changeCallbacks[key] = callback;
  }

  // Register a global callback for any model value change
  public onAnyFieldChanged(callback: GlobalChangeCallback): void {
    this.globalChangeCallback = callback;
  }

  // Update the model and all bound elements
  public updateModel(key: string, value: any): void {
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
  private updateBindings(key: string): void {
    if (this.bindings[key]) {
      this.bindings[key].forEach((element) => {
        if (element instanceof HTMLFormElement) {
          if (element.type === "radio" || element.type === "checkbox") {
            element.checked = Array.isArray(this.model[key])
              ? this.model[key].includes(element.value)
              : this.model[key] === element.value || this.model[key] === true;
          } else {
            element.value = this.model[key].value;
          }
        } else {
          element.textContent = this.model[key];
        }
      });
    }
  }

  // Update all template bindings
  private updateTemplateBindings(): void {
    this.templateBindings.forEach(({ node, key, template }) => {
      if (this.model[key] !== undefined) {
        node.nodeValue = template.replace(/{{\s*([\w]+)\s*}}/g, (_, field) => {
          return this.model[field] !== undefined ? this.model[field] : "";
        });
      }
    });
  }
}
