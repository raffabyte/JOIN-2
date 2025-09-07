/**
 * Creates a reusable, filterable dropdown component.
 * @class
 */
class CustomDropdown {
  /** Initializes a dropdown instance with options and configuration. */
  constructor(idPrefix, options, config = {}) {
    this.idPrefix = idPrefix;
    this.options = options;
    this.isMultiSelect = config.isMultiSelect || false;
    this.onSelect = config.onSelect;
    this.onChange = config.onChange;
    this.getInitials = config.getInitials;
    this.isSelected = config.isSelected;

    this._cacheDOMElements();
    this._registerEventListeners();

    if (!CustomDropdown.instances) CustomDropdown.instances = [];
    CustomDropdown.instances.push(this);
  }


  /** Caches required DOM elements for this dropdown instance. */
  _cacheDOMElements() {
    this.input = document.getElementById(`${this.idPrefix}-input`);
    this.toggleBtn = document.getElementById(`${this.idPrefix}-toggle-btn`);
    this.optionsContainer = document.getElementById(`${this.idPrefix}-options`);
  }


  /** Registers UI event listeners for toggle, input, and selection. */
  _registerEventListeners() {
    this.toggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });

    this.input?.addEventListener("input", () => this._renderOptions());

    if (this.isMultiSelect) {
      this.optionsContainer.addEventListener("change", (e) => {
        if (e.target.type === "checkbox") this.onChange?.();
      });
    }
  }


  /** Opens the dropdown if closed; otherwise closes all first. */
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


  /** Renders the option list based on the current input filter. */
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


  /** Creates a list item element for a given option. */
  _createOptionItem(option) {
    const li = document.createElement("li");
    li.className = this.isMultiSelect ? "checkbox-option" : "dropdown-option";
    li.innerHTML = this._getOptionHTML(option);

    if (this.isMultiSelect) {
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
      li.addEventListener("click", () => {
        const label = typeof option === "string"
          ? option
          : (option.name ?? option.label ?? option.value ?? "");
        if (this.input) this.input.value = label;
        this.onSelect?.(option);
        this.close();
      });
    }

    return li;
  }


  /** Returns the HTML markup for a single option row. */
  _getOptionHTML(option) {
    if (!this.isMultiSelect) {
      const label = typeof option === "string"
        ? option
        : (option.name ?? option.label ?? option.value ?? "");
      return `<span class="option-label">${label}</span>`;
    }

    const initials = this.getInitials
      ? this.getInitials(option.name)
      : (option.name || "?").slice(0, 2).toUpperCase();

    const key = (option.email ?? option.value ?? option.name ?? "").trim().toLowerCase();
    let isChecked = false;
    if (typeof this.isSelected === "function") {
      isChecked = !!this.isSelected(option);
    } else if (window.addTaskManager?.state?.selectedAssignees) {
      isChecked = window.addTaskManager.state.selectedAssignees.has(key);
    }

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


  /** Checks if an option matches the given lowercase filter. */
  _filterOption(option, filter) {
    const optionName = typeof option === "string" ? option : option.name;
    return optionName.toLowerCase().includes(filter);
  }


  /** Closes this dropdown instance and resets toggle state. */
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


/** Closes all dropdowns when clicking outside any dropdown container. */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    CustomDropdown.closeAll();
  }
});