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
  get autosubmit() {
    return localStorage.getItem("AutoMate-autosubmit") === "yes";
  }
  get autorun() {
    return localStorage.getItem("AutoMate-autorun") === "yes";
  }
  get targetForm() {
    return document.querySelector(this.selector);
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
  get valuePersonNumber() {
    return "980419-2137";
  }
  get valuePersonNumberLong() {
    return "19980419-2137";
  }

  /**
   * Setters
   */
  set selector(value) {
    localStorage.setItem("AutoMate-selector", value);
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
    this.fillForm();
  }

  /**
   * Fill form if present, else wait for it.
   */
  observeForm() {
    if (this.targetForm) {
      this.fillForm();
    } else {
      this.waitForElm(this.selector).then((elm) => {
        this.fillForm();
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
   * Fills the form with default values.
   */
  fillForm() {
    this.targetForm.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") {
        input.checked = true;
        return;
      }

      const name = input.name.toLowerCase();

      // Email
      if (/mail/.test(name)) {
        input.value = this.valueEmail;
        // Person number
      } else if (
        /person/.test(name) &&
        (/no/.test(name) || /number/.test(name))
      ) {
        input.value = this.valuePersonNumber;
        // Phone
      } else if (/phone/.test(name)) {
        input.value = this.valuePhone;
        // Zip
      } else if (/zip/.test(name)) {
        input.value = this.valueZip;
        // Default
      } else {
        input.value = this.valueDefault;
      }
    });

    if (this.autosubmit && !this.autorun) {
      this.targetForm.submit();
    }
  }

  /**
   * Escapes string for use in template literals.
   * @param {string} text - the text to be escaped.
   */
  safe(text) {
    if (!text) {
      return '';
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
            <label for="autosubmit">
              <input id="autosubmit" name="autosubmit" type="checkbox" value="yes" ${
                this.autosubmit && 'checked="checked"'
              } /> Auto submit
            </label>
          </div>
          
          <div class="field">
            <label for="autorun">
              <input id="autorun" name="autorun" type="checkbox" value="yes" ${
                this.autorun && 'checked="checked"'
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
