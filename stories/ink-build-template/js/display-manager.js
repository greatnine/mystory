// display-manager.js
class DisplayManager {
  constructor() {
    this.container = document.querySelector("#story");
    this._scrollContainer = document.querySelector(".outerContainer");
    this.history = [];

    if (!this.container) {
      window.errorManager.critical(
        "未找到故事容器元素",
        new Error("Missing #story element"),
        "display",
      );
      return;
    }

    this.domHelpers = new DOMHelpers(this.container);
  }

  /**
   * 滚动容器：移动端让 body 自然滚动（地址栏可自动收起），桌面端用 outerContainer
   */
  get scrollContainer() {
    return this._isMobileViewport() ? window : this._scrollContainer;
  }

  _isMobileViewport() {
    return window.matchMedia("(max-width: 680px)").matches;
  }

  _getScrollTop(scroller) {
    return scroller === window ? window.scrollY : scroller.scrollTop;
  }

  _setScrollTop(scroller, val) {
    if (scroller === window) {
      window.scrollTo(0, val);
    } else {
      scroller.scrollTop = val;
    }
  }

  _getScrollerRect(scroller) {
    if (scroller === window) {
      return {
        top: 0,
        bottom: window.innerHeight,
        height: window.innerHeight,
        left: 0,
        right: window.innerWidth,
        width: window.innerWidth,
      };
    }
    return scroller.getBoundingClientRect();
  }

  _getScrollHeight(scroller) {
    if (scroller === window) {
      return Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
    }
    return scroller.scrollHeight;
  }

  _getClientHeight(scroller) {
    return scroller === window ? window.innerHeight : scroller.clientHeight;
  }

  _getScrollerPaddingTop(scroller) {
    if (scroller === window) {
      const oc = this._scrollContainer;
      return oc ? parseFloat(getComputedStyle(oc).paddingTop) || 0 : 0;
    }
    return parseFloat(getComputedStyle(scroller).paddingTop) || 0;
  }

  /**
   * Render an array of content items to the display
   * @param {Array} content - Array of content objects with text, classes, etc.
   */
  render(content) {
    if (!Array.isArray(content)) {
      window.errorManager.warning(
        "Invalid content passed to render - expected array",
        null,
        "display",
      );
      return;
    }

    content.forEach((item, index) => {
      try {
        const element = this.createElement(item);
        if (element) {
          this.trackInHistory(item);
        }
      } catch (error) {
        window.errorManager.error(
          `渲染内容项失败（索引 ${index}）`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Render an array of choice objects
   * @param {Array} choices - Array of choice objects with text, classes, onClick
   */
  renderChoices(choices) {
    if (!Array.isArray(choices)) {
      window.errorManager.warning(
        "Invalid choices passed to renderChoices - expected array",
        null,
        "display",
      );
      return;
    }

    choices.forEach((choice, index) => {
      try {
        const element = this.domHelpers.createChoice(
          choice.text || "",
          choice.classes || [],
          choice.isClickable !== false,
        );

        if (choice.isClickable !== false && choice.onClick) {
          if (typeof choice.onClick === "function") {
            this.domHelpers.addChoiceClickHandler(element, choice.onClick);
          } else {
            window.errorManager.warning(
              `Choice at index ${index} has invalid onClick handler`,
              null,
              "display",
            );
          }
        }

        if (element && this.shouldAnimateContent()) {
          this.fadeInElement(element);
        }
      } catch (error) {
        window.errorManager.error(
          `渲染选项失败（索引 ${index}）`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Create a DOM element from a content object
   * @param {Object} content - Content object with text and classes
   * @returns {HTMLElement|null} The created element or null if failed
   */
  createElement(content) {
    // Validate content object
    if (!content?.text || typeof content.text !== "string") {
      window.errorManager.warning(
        "createElement called with invalid content",
        null,
        "display",
      );
      return null;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "无法创建元素——DOM 助手不可用",
        null,
        "display",
      );
      return null;
    }

    try {
      const processedText = MarkdownProcessor.process(content.text);
      const element = this.domHelpers.createParagraph(
        processedText,
        content.classes || [],
      );

      if (
        content.classes &&
        content.classes.includes("user-input-placeholder")
      ) {
        // This is a user input placeholder
        this.convertToUserInput(
          element,
          content.classes,
          content.placeholderText,
        );
      } else if (content.classes && content.classes.includes("has-image")) {
        // This is an image placeholder
        this.handleImageForParagraph(element, content.classes);
      } else if (element && this.shouldAnimateContent()) {
        this.fadeInElement(element);
      }

      return element;
    } catch (error) {
      window.errorManager.error("创建元素失败", error, "display");
      return null;
    }
  }

  convertToUserInput(
    element,
    classes,
    placeholderText = "Type your answer here...",
  ) {
    if (!element) return;
    const varClass = classes.find((cls) => cls.startsWith("user-input-var-"));
    if (!varClass) return;
    const variableName = varClass.replace("user-input-var-", "");

    // Check for [] to use empty placeholder
    if (placeholderText === "[]") {
      placeholderText = "";
    } else if (placeholderText && placeholderText.includes("{")) {
      placeholderText = placeholderText.replace(/\{[^}]+\}/g, "___");
    }

    element.innerHTML = `
    <div class="user-input-inline-container">
      <div class="user-input-prompt">
        <input type="text" class="user-input-inline-field" 
               placeholder="${placeholderText}" 
               maxlength="100" autocomplete="off">
        <button class="user-input-submit-btn">Submit 提交</button>
      </div>
      <div class="user-input-help">按 Enter 或点击提交以继续<br>Press Enter or click Submit to continue</div>
    </div>
  `;

    const inputField = element.querySelector(".user-input-inline-field");
    const submitBtn = element.querySelector(".user-input-submit-btn");

    // Focus the input
    setTimeout(() => inputField.focus(), 100);

    // Handle submission
    const submitInput = () => {
      const userInput = inputField.value.trim();

      if (!userInput) {
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Please enter a value... 请输入内容";
        inputField.focus();
        return;
      }

      try {
        // Set the Ink variable
        window.storyManager.story.variablesState.$(variableName, userInput);

        // Replace input with user's response
        element.innerHTML = `<span class="user-input-response">${userInput}</span>`;

        // Continue the story
        window.storyManager.continueWithoutClearing();
      } catch (error) {
        window.errorManager.error(
          "设置用户输入变量失败",
          error,
          "display",
        );
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "出错了，请重试……";
      }
    };

    // Event listeners
    submitBtn.addEventListener("click", submitInput);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitInput();
    });

    inputField.addEventListener("input", () => {
      inputField.style.borderColor = "";
    });
  }

  handleImageForParagraph(element, classes) {
    if (!element || !window._pendingImages) return;

    // Find the image ID from classes
    const imageClass = classes.find((cls) => cls.startsWith("image-img_"));
    if (!imageClass) return;

    const imageId = imageClass.replace("image-", "");
    const imageData = window._pendingImages.find((img) => img.id === imageId);

    if (!imageData) return;

    // Remove from pending list
    window._pendingImages = window._pendingImages.filter(
      (img) => img.id !== imageId,
    );

    // Create the image element
    const imageElement = document.createElement("img");
    imageElement.src = imageData.src;
    if (imageData.alt) imageElement.alt = imageData.alt;
    imageElement.className = "story-image";

    // 应用 IMAGE 标签的可选参数：位置与尺寸
    (imageData.params || []).forEach((param) => {
      if (/^[\d.]+(vw|vh|px|%|em|rem)$/i.test(param)) {
        imageElement.style.width = param;
      } else if (param === "top") {
        imageElement.classList.add("story-image-top");
      } else if (param === "bottom") {
        imageElement.classList.add("story-image-bottom");
      } else if (param === "left") {
        imageElement.style.marginLeft = "0";
        imageElement.style.marginRight = "auto";
      } else if (param === "right") {
        imageElement.style.marginLeft = "auto";
        imageElement.style.marginRight = "0";
      }
      // center 为默认样式，无需处理
    });

    imageElement.onerror = () => {
      window.errorManager.warning(
        `加载图片失败：${imageData.src}`,
        null,
        "display",
      );
    };

    // Always insert BEFORE this paragraph (inline positioning)
    // This makes the image appear where the IMAGE tag is in Ink
    element.parentNode.insertBefore(imageElement, element);

    // Apply fade-in animation if enabled
    if (this.shouldAnimateContent()) {
      this.fadeInElement(imageElement);
    }
  }

  shouldAnimateContent() {
    try {
      const settings = window.storyManager?.settings;
      if (!settings?.getSetting) {
        return true;
      }
      const result = settings.getSetting("animations") === true;
      return result;
    } catch (error) {
      console.log("Error checking animations, defaulting to true");
      return true;
    }
  }
  fadeInElement(element) {
    if (!element) return;
    try {
      element.style.opacity = "0";
      element.offsetHeight; // Force reflow
      element.style.opacity = "1";
    } catch (error) {
      element.style.opacity = "1";
    }
  }

  /**
   * Clear all story content and reset history
   */
  clear() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "无法清空——DOM 助手不可用",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
    this.history = [];
  }

  /**
   * Clear content but preserve history (for regenerating from saves)
   */
  clearContent() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "无法清空内容——DOM 助手不可用",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
  }

  /**
   * Scroll the container to the top
   */
  scrollToTop() {
    if (!this.scrollContainer) {
      window.errorManager.warning(
        "Cannot scroll - scroll container not available",
        null,
        "display",
      );
      return;
    }

    const scroller = this.scrollContainer;
    if (scroller === window) {
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      return;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "无法滚动——DOM 助手不可用",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.scrollToTop(scroller);
  }

  /**
   * 在正文末尾插入一条居中的水平虚线，用于分隔前后两段剧情
   * @param {boolean} track - 是否记录到历史（恢复存档时需要重建）
   * @returns {HTMLElement|null} 创建出的分隔线元素
   */
  addDivider(track = true) {
    if (!this.container) {
      window.errorManager.error(
        "无法创建分隔线——故事容器不可用",
        null,
        "display",
      );
      return null;
    }

    try {
      const divider = document.createElement("div");
      divider.className = "story-divider";
      divider.setAttribute("aria-hidden", "true");
      this.container.appendChild(divider);

      if (track) {
        this.history.push({ type: "divider", timestamp: Date.now() });
      }

      return divider;
    } catch (error) {
      window.errorManager.error("创建分隔线失败", error, "display");
      return null;
    }
  }

  /**
   * 将指定元素缓缓滚动到故事文本框的上边缘
   * @param {HTMLElement} element - 目标元素（分隔线）
   * @param {number} duration - 动画时长（毫秒）
   */
  scrollElementToTop(element, duration = 800) {
    if (!element || !this.scrollContainer) return;

    requestAnimationFrame(() => {
      try {
        const scroller = this.scrollContainer;
        const paddingTop = this._getScrollerPaddingTop(scroller);
        const scrollerRect = this._getScrollerRect(scroller);
        const elementRect = element.getBoundingClientRect();

        // 目标位置：使目标元素停在文本框内容区的上边缘，
        // 留出少量呼吸位，避免图片/布局微调时被顶出框
        const TOP_GAP = 12;
        const target = Math.max(
          0,
          this._getScrollTop(scroller) +
            (elementRect.top - scrollerRect.top) -
            paddingTop -
            TOP_GAP,
        );

        // 目标位置超出底部滚动范围时，临时增加底部留白，保证能滚到顶
        let maxScroll = Math.max(
          0,
          this._getScrollHeight(scroller) - this._getClientHeight(scroller),
        );
        if (target > maxScroll && this.container) {
          if (this._baseBottomPadding === undefined) {
            this._baseBottomPadding =
              parseFloat(getComputedStyle(this.container).paddingBottom) || 0;
          }
          const shortfall = target - maxScroll + 16;
          const currentExtra = this._extraBottomPadding || 0;
          const nextExtra = Math.min(
            this._getClientHeight(scroller),
            currentExtra + shortfall,
          );
          this.container.style.paddingBottom =
            `${this._baseBottomPadding + nextExtra}px`;
          this._extraBottomPadding = nextExtra;
          void this.container.offsetHeight; // 强制重排
          maxScroll = Math.max(
            0,
            this._getScrollHeight(scroller) - this._getClientHeight(scroller),
          );
        }

        const destination = Math.min(target, maxScroll);
        const start = this._getScrollTop(scroller);
        const distance = destination - start;

        if (Math.abs(distance) < 2) return;

        const startTime = performance.now();
        const easeInOutCubic = (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (now) => {
          const progress = Math.min(1, (now - startTime) / duration);
          this._setScrollTop(
            scroller,
            start + distance * easeInOutCubic(progress),
          );
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            this._setScrollTop(scroller, destination);
          }
        };
        requestAnimationFrame(step);
      } catch (error) {
        window.errorManager.warning(
          "滚动到分隔线失败",
          error,
          "display",
        );
      }
    });
  }

  /**
   * Hide the story header
   */
  hideHeader() {
    this.domHelpers?.setVisible?.(".header", false);
  }

  /**
   * Show the story header
   */
  showHeader() {
    this.domHelpers?.setVisible?.(".header", true);
  }

  /**
   * Get the current display state for saving
   * @returns {Object} Current display state
   */
  getState() {
    return {
      history: [...this.history], // Copy the array
    };
  }

  /**
   * Restore display state from a saved state
   * @param {Object} state - Previously saved display state
   */
  restoreState(state) {
    if (!state || typeof state !== "object") {
      window.errorManager.warning(
        "Invalid state passed to restoreState",
        null,
        "display",
      );
      return;
    }

    this.history = Array.isArray(state.history) ? state.history : [];
    this.clearContent();

    // Rebuild from history
    this.history.forEach((item, index) => {
      try {
        // 分隔线不是段落，单独重建
        if (item.type === "divider") {
          this.addDivider(false);
          return;
        }

        const content = {
          text: item.text || "",
          classes: Array.isArray(item.classes) ? item.classes : [],
        };
        this.createElement(content);
      } catch (error) {
        window.errorManager.error(
          `恢复历史记录项失败（索引 ${index}）`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Track a content item in the display history
   * @param {Object} item - Content item to track
   */
  trackInHistory(item) {
    if (!item || typeof item !== "object") {
      window.errorManager.warning(
        "Invalid item passed to trackInHistory",
        null,
        "display",
      );
      return;
    }

    this.history.push({
      type: "paragraph",
      text: item.text || "",
      classes: Array.isArray(item.classes) ? item.classes : [],
      timestamp: Date.now(),
    });
  }

  /**
   * Reset the display to initial state
   */
  reset() {
    this.clear();
    this.showHeader();
  }

  /**
   * Get the number of items in display history
   * @returns {number} Number of items in history
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Check if display has any content
   * @returns {boolean} True if display has content
   */
  hasContent() {
    return this.history.length > 0;
  }

  /**
   * Get display statistics for debugging
   * @returns {Object} Display statistics
   */
  getStats() {
    return {
      historyLength: this.history.length,
      hasContainer: !!this.container,
      hasScrollContainer: !!this.scrollContainer,
      hasDomHelpers: !!this.domHelpers,
      containerElementCount: this.container
        ? this.container.children.length
        : 0,
    };
  }

  /**
   * Validate that the display manager is in a working state
   * @returns {boolean} True if display manager is ready to use
   */
  isReady() {
    return !!(this.container && this.domHelpers);
  }

  /**
   * Attempt to recover from a broken state
   */
  recover() {
    // Try to re-find container elements
    if (!this.container) {
      this.container = document.querySelector("#story");
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector(".outerContainer");
    }

    // Try to recreate DOM helpers if missing
    if (!this.domHelpers && this.container) {
      this.domHelpers = new DOMHelpers(this.container);
    }

    // Clear any corrupted history
    if (!Array.isArray(this.history)) {
      this.history = [];
    }
  }
}
