/**
 * Creates a reusable, filterable dropdown component.
 * @class
 */
class CustomDropdown {
  /**
   * @param {string} idPrefix
   * @param {Array<string|object>} options
   * @param {object} config
   * @param {boolean} [config.isMultiSelect=false]
   * @param {function} [config.onSelect]
   * @param {function} [config.onChange]
   * @param {function} [config.getInitials]
   */
  constructor(idPrefix, options, config = {}) {
    this.idPrefix = idPrefix;
    this.options = options;
    this.isMultiSelect = config.isMultiSelect || false;
    this.onSelect = config.onSelect;
    this.onChange = config.onChange;
    this.getInitials = config.getInitials;

    this._cacheDOMElements();
    this._registerEventListeners();

    // Keep track of all instances to close them globally
    if (!CustomDropdown.instances) {
      CustomDropdown.instances = [];
    }
    CustomDropdown.instances.push(this);
  }

  _cacheDOMElements() {
    this.input = document.getElementById(`${this.idPrefix}-input`);
    this.toggleBtn = document.getElementById(`${this.idPrefix}-toggle-btn`);
    this.optionsContainer = document.getElementById(`${this.idPrefix}-options`);
  }

  _registerEventListeners() {
    this.toggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });

    this.input?.addEventListener("input", () => this._renderOptions());

    if (this.isMultiSelect) {
      // Use event delegation for checkboxes
      this.optionsContainer.addEventListener("change", (e) => {
        if (e.target.type === "checkbox") {
          this.onChange?.(); // Fire the callback
        }
      });
    }
  }

  _toggle() {
  const isOpen =
    this.optionsContainer.classList.contains("show") ||
    this.optionsContainer.classList.contains("active");

  CustomDropdown.closeAll();
  if (!isOpen) {
    this.optionsContainer.classList.add("show", "active");
    this.optionsContainer.classList.remove("display-none");
    this.toggleBtn.classList.add("open");
    this._renderOptions();
  }
}


  _renderOptions() {
    const filter = this.input.value.toLowerCase();
    this.optionsContainer.innerHTML = "";

    this.options
      .filter((opt) => this._filterOption(opt, filter))
      .forEach((option) => {
        const li = this._createOptionItem(option);
        this.optionsContainer.appendChild(li);
      });
  }

  /**
   * Creates a single list item element for a dropdown.
   */
  _createOptionItem(option) {
  const li = document.createElement("li");
  li.className = this.isMultiSelect ? "checkbox-option" : "dropdown-option";
  li.innerHTML = this._getOptionHTML(option);

  if (this.isMultiSelect) {
    // Toggle Checkbox-Klick auch über LI
    li.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      const checkbox = li.querySelector('input[type="checkbox"]');
      const customCheckboxSpan = li.querySelector(".custom-checkbox");
      if (!checkbox || !customCheckboxSpan) return;

      checkbox.checked = !checkbox.checked;
      customCheckboxSpan.innerHTML = checkbox.checked
        ? CHECKBOX_FILLED_DARK_SVG
        : CHECKBOX_SVG;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      e.stopPropagation();
    });
  } else {
    // Single-Select: Wert setzen + onSelect feuern + schließen
    li.addEventListener("click", () => {
      const label = typeof option === "string"
        ? option
        : (option.name ?? option.label ?? option.value ?? "");
      if (this.input) this.input.value = label;
      this.onSelect?.(option); // falls du extra Infos brauchst, hier auch {value,label} mitgeben
      this.close();
    });
  }

  return li;
}


  // Logic for contact/user object
  _getOptionHTML(option) {
  // Single-Select (z. B. Category): einfacher Label-Render, KEIN getInitials
  if (!this.isMultiSelect) {
    const label = typeof option === "string"
      ? option
      : (option.name ?? option.label ?? option.value ?? "");
    return `<span class="option-label">${label}</span>`;
  }

  // Multi-Select (z. B. Assignees): Kontakt-Markup
  // Schutz: getInitials kann fehlen
  const initials = this.getInitials
    ? this.getInitials(option.name)
    : (option.name || "?").slice(0, 2).toUpperCase();

  const isChecked = document.querySelector(
    `input[name="assigned"][value="${option.email}"]`
  )?.checked;

  return `
    <div class="contact-info">
      <span class="initial-badge-circle" style="background-color: ${option.color};">${initials}</span>
      <span class="contact-name">${option.name}</span>
    </div>
    <input type="checkbox" name="assigned" value="${option.email}" ${isChecked ? "checked" : ""} class="d-none">
    <span class="custom-checkbox">
      ${isChecked ? CHECKBOX_FILLED_DARK_SVG : CHECKBOX_SVG}
    </span>
  `;
}


  _filterOption(option, filter) {
    const optionName = typeof option === "string" ? option : option.name;
    return optionName.toLowerCase().includes(filter);
  }

  close() {
  this.optionsContainer.classList.remove("show", "active");
  this.optionsContainer.classList.add("display-none");
  this.toggleBtn.classList.remove("open");
}

  /** Closes all dropdown instances on the page. */
  static closeAll() {
    CustomDropdown.instances?.forEach((instance) => instance.close());
  }
}

// Global click listener to close dropdowns
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    CustomDropdown.closeAll();
  }
});
