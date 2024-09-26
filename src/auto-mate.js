/**
 * AutoMate
 * @class
 * @constructor
 * @public
 */
class AutoMate extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  /**
   * Getters
   */
  get form() {
    return this.shadowRoot.getElementById("form");
  }
  get goButton() {
    return this.shadowRoot.getElementById("go");
  }
  get selector() {
    return localStorage.getItem("AutoMate-selector");
  }
  get ignoredFields() {
    return localStorage.getItem("AutoMate-ignored-fields");
  }
  get autosubmit() {
    return localStorage.getItem("AutoMate-autosubmit") === "yes";
  }
  get autorun() {
    return localStorage.getItem("AutoMate-autorun") === "yes";
  }
  get targetForm() {
    return document.querySelector(this.selector);
  }
  get ignoredFieldsArray() {
    return (
      this.ignoredFields
        .split(",")
        .filter((s) => s)
        .map((selector) => {
          return document.querySelector(selector);
        }) || []
    );
  }
  get valueDefault() {
    return "Test";
  }
  get valueEmail() {
    return "test@testsson.xyz.se";
  }
  get valuePhone() {
    return "0701234567";
  }
  get valueZip() {
    return "12345";
  }
  get valueCost() {
    return "25000";
  }
  get valueAccountNumber() {
    return "94204172385";
  }
  get valueNumber() {
    return "2";
  }
  get valuePersonNumber() {
    return "980419-2137";
  }
  get valuePersonNumberLong() {
    return "199804192137";
  }

  /**
   * Setters
   */
  set selector(value) {
    localStorage.setItem("AutoMate-selector", value);
  }
  set ignoredFields(value) {
    localStorage.setItem("AutoMate-ignored-fields", value);
  }
  set autosubmit(value) {
    localStorage.setItem("AutoMate-autosubmit", value);
  }
  set autorun(value) {
    localStorage.setItem("AutoMate-autorun", value);
  }

  /**
   * connectedCallback
   * Render html/css & attatch event listeners
   */
  connectedCallback() {
    // Render
    this.render();

    /**
     * @type {HTMLFormElement | null}
     */
    this.form.addEventListener("submit", this);

    /**
     * @type {HTMLButtonElement | null}
     */
    this.goButton.addEventListener("click", this);

    if (this.autorun) {
      this.observeForm();
    }
  }

  /**
   * disconnectedCallback
   * Remove listeners.
   */
  disconnectedCallback() {
    this.form.removeEventListener("submit", this);
    this.goButton.removeEventListener("click", this);
  }

  /**
   * handles all events, routes them to on`Eventname` for each.
   * E.g. a `click` event will call `this.onClick`,
   * a focus event will call `this.onFocus`.
   * @param {Event} event - event.
   */
  handleEvent(event) {
    this[`on${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`](
      event,
    );
  }

  /**
   * On submit callback.
   * @param {Event} e - on submit callback.
   */
  onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    this.selector = formData.get("selector");
    this.ignoredFields = formData.get("ignore");
    this.autosubmit = formData.get("autosubmit");
    this.autorun = formData.get("autorun");

    if (this.autorun) {
      this.observeForm();
    }
  }

  /**
   * On click callback.
   */
  onClick() {
    this.triggerFillForm();
  }

  /**
   * Fill form if present, else wait for it.
   */
  observeForm() {
    if (this.targetForm) {
      this.triggerFillForm();
    } else {
      this.waitForElm(this.selector).then((elm) => {
        this.triggerFillForm();
      });
    }
  }

  /**
   * Helper to wait for an element to be present.
   * @see: https://stackoverflow.com/a/61511955
   */
  waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * Triggers the fill form method
   * It is runned twice because sometimes changes to inputs can display new inputs.
   */
  triggerFillForm() {
    this.fillForm();
    setTimeout(() => {
      this.fillForm();
    }, 50);
  }

  /**
   * Fills the form with default values.
   */
  fillForm() {
    this.targetForm.querySelectorAll("input").forEach((input) => {
      if (this.ignoredFieldsArray.includes(input)) {
        return;
      }
      const name = input.name.toLowerCase();

      // Email
      if (/mail/.test(name)) {
        this.enterValue(input, this.valueEmail);
        // Person number
      } else if (
        /person/.test(name) &&
        (/no/.test(name) || /number/.test(name))
      ) {
        this.enterValue(input, this.valuePersonNumber);
        // Person number 2
      } else if (/civic/.test(name)) {
        this.enterValue(input, this.valuePersonNumberLong);
        // Phone
      } else if (/phone/.test(name)) {
        this.enterValue(input, this.valuePhone);
        // Zip
      } else if (/zip/.test(name)) {
        this.enterValue(input, this.valueZip);
        // Cost
      } else if (
        /cost/.test(name) ||
        /income/.test(name) ||
        /loan/.test(name) ||
        /debt/.test(name) ||
        /amount/.test(name) ||
        /salary/.test(name)
      ) {
        this.enterValue(input, this.valueCost);
        // Account number
      } else if (/accountnum/.test(name)) {
        this.enterValue(input, this.valueAccountNumber);
        // Number
      } else if (/number/.test(name)) {
        this.enterValue(input, this.valueNumber);
        // Default
      } else {
        this.enterValue(input, this.valueDefault);
      }
    });

    this.targetForm.querySelectorAll("select").forEach((select) => {
      this.enterSelectValue(select);
    });

    if (this.autosubmit && !this.autorun) {
      if (this.targetForm.submit) {
        this.targetForm.submit();
      } else {
        const submitBtn = this.targetForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }
    }
  }

  /**
   * Enters a value on an input.
   */
  enterValue(input, value) {
    if (input.type === "checkbox") {
      if (!input.checked) {
        const event = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: false,
        });
        input.dispatchEvent(event);
      }
    } else {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      nativeInputValueSetter.call(input, value);
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);
    }

    // For selects?
  }

  /**
   * Enters a value on an select.
   * @see: https://stackoverflow.com/a/61741796
   */
  enterSelectValue(select) {
    let value;
    if (select.options.length > 1) {
      value = select.options[1].value;
    } else {
      value = select.options[0].value;
    }

    var trigger = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value",
    ).set;
    trigger.call(select, value);
    var event = new Event("change", { bubbles: true });
    select.dispatchEvent(event);
  }

  /**
   * Escapes string for use in template literals.
   * @param {string} text - the text to be escaped.
   */
  safe(text) {
    if (!text) {
      return "";
    }
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (c) => map[c]);
  }

  /**
   * Renders the component html/css.
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          position: fixed;
          top: 0.5rem;
          right: 0.5rem;
          background-color: white;
          padding: 1rem;
          box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 3px 0px;
          z-index: 10000;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        #form {
          max-width: 300px;
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
          border-bottom: 1px solid #aaa;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
        }
        label {
          display: block;
        }
        input:not([type="checkbox"]) {
          padding: 0.5rem;
          width: 100%;
        }
      </style>
      
      <div>
        <form id="form">
          <div class="field">
            <label for="selector">Selector</label>
            <input id="selector" name="selector" type="text" value="${this.safe(
      this.selector,
    )}" autocomplete="off" />
          </div>
          
          <div class="field">
            <label for="ignore">Ignored fields</label>
            <input id="ignore" name="ignore" type="text" value="${this.safe(
      this.ignoredFields,
    )}" autocomplete="off" />
          </div>
          
          <div class="field">
            <label for="autosubmit">
              <input id="autosubmit" name="autosubmit" type="checkbox" value="yes" ${this.autosubmit && 'checked="checked"'
      } /> Auto submit
            </label>
          </div>
          
          <div class="field">
            <label for="autorun">
              <input id="autorun" name="autorun" type="checkbox" value="yes" ${this.autorun && 'checked="checked"'
      } /> Auto run
            </label>
          </div>
          
          <button type="submit">Save</button>
        </form>
        <button id="go" type="button">GO!</button>
      </div>
    `;
  }
}

window.customElements.define("auto-mate", AutoMate);
