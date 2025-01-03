class Binder {
  private items: HTMLElement[] = [];
  private inputTypes: string[] = ["INPUT", "TEXTAREA", "SELECT"];
  private tickable: string[] = ["checkbox", "radio"];
  private model: Record<string, any>;
  private modelChangedCallback: (property: string, value: any) => void;
  private app: HTMLElement;
  constructor(
    appId: string,
    model: Record<string, any>,
    modelChangedCallback: (property: string, value: any) => void
  ) {
    this.model = model;
    this.modelChangedCallback = modelChangedCallback;
    const appElement = document.getElementById(appId);
    if (!appElement) {
      throw new Error(`No element with the appId found: ${appId}`);
    }
    this.app = appElement;
    this.load();
  }
  private load(): void {
    const elements = this.app.querySelectorAll("[data-bind]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-bind");
      if (key) {
        this.addElement(element as HTMLElement, key, this.model);
      }
    });
  }
  private addElement(
    element: HTMLElement,
    key: string,
    model: Record<string, any>
  ): void {
    this.items.push(element);
    this.updateElementValue(element, model[key]);
    if (this.inputTypes.includes(element.tagName)) {
      const inputElement = element as HTMLInputElement;
      if (this.tickable.includes(inputElement.type)) {
        inputElement.addEventListener("change", (e) =>
          this.tickableElementChangeHandler(e)
        );
      } else {
        inputElement.addEventListener("input", () =>
          this.inputHandler(inputElement, key)
        );
      }
    }
  }
  private tickableElementChangeHandler(event: Event): void {
    const target = event.target as HTMLInputElement;
    const key = target.getAttribute("data-bind");
    if (!key) return;
    const value =
      document.querySelector<HTMLInputElement>(`[data-bind="${key}"]:checked`)
        ?.value ?? "";
    this.model[key] = value;
    this.modelValueChangedHandler(key, value);
  }
  private inputHandler(element: HTMLInputElement, key: string): void {
    const value = element.value ?? "";
    this.model[key] = value;
    this.modelValueChangedHandler(key, value);
  }
  private modelValueChangedHandler(property: string, value: any): void {
    const toChange = this.items.filter(
      (v) => v.getAttribute("data-bind") === property
    );
    toChange.forEach((e) => {
      const element = e as HTMLInputElement;
      if(this.tickable.includes(element.type))
      {
             if(element.value === value)
             {element.checked = true }
      }
      else{

            this.updateElementValue(e, value);}
    }
    );
    this.modelChangedCallback(property, value);
  }
  private updateElementValue(element: HTMLElement, value: any): void {
    if (value === undefined) return;
    if (this.inputTypes.includes(element.tagName)) {
      const inputElement = element as HTMLInputElement;
      if (this.tickable.includes(inputElement.type)) {
        inputElement.checked = Boolean(value);
      } else {
        inputElement.value = value;
      }
    } else {
      element.textContent = value;
    }
  }
}
