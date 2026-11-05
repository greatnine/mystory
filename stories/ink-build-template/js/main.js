// main.js

// === 移动端顶栏滚动收起行为 ===
// 往下滚 → 顶栏滑走，最大化阅读面积
// 往上拉 / 触摸 → 顶栏立即还原
(function initMobileNavBehavior() {
  const MOBILE_MEDIA = "(max-width: 680px)";
  const nav = document.querySelector(".top-nav");
  const body = document.body;
  const container = document.querySelector(".outerContainer");
  if (!nav || !container) return;

  let enabled = false;
  let lastScrollY = 0;
  let ticking = false;
  const SHOW_THRESHOLD = 8;
  const HIDE_THRESHOLD = 24;
  let accumulatedUp = 0;
  let accumulatedDown = 0;
  let lastDirection = 0;

  function resetState() {
    nav.classList.remove("nav-collapsed");
    body.classList.remove("nav-collapsed");
    lastScrollY = 0;
    accumulatedUp = 0;
    accumulatedDown = 0;
    lastDirection = 0;
  }

  function update() {
    ticking = false;
    if (!enabled) return;
    const currentY = container.scrollTop;
    const delta = currentY - lastScrollY;

    if (delta > 0) {
      if (lastDirection !== 1) { accumulatedDown = 0; accumulatedUp = 0; }
      accumulatedDown += delta;
      accumulatedUp = 0;
      if (accumulatedDown > HIDE_THRESHOLD && currentY > 40) {
        nav.classList.add("nav-collapsed");
        body.classList.add("nav-collapsed");
      }
      lastDirection = 1;
    } else if (delta < 0) {
      if (lastDirection !== -1) { accumulatedUp = 0; accumulatedDown = 0; }
      accumulatedUp -= delta;
      accumulatedDown = 0;
      if (accumulatedUp > SHOW_THRESHOLD) {
        nav.classList.remove("nav-collapsed");
        body.classList.remove("nav-collapsed");
      }
      lastDirection = -1;
    }

    if (currentY <= 40) {
      nav.classList.remove("nav-collapsed");
      body.classList.remove("nav-collapsed");
    }
    lastScrollY = currentY;
  }

  const onScroll = () => {
    if (!enabled) return;
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  const onTouchStart = () => {
    if (!enabled) return;
    nav.classList.remove("nav-collapsed");
    body.classList.remove("nav-collapsed");
  };

  function enable() {
    if (enabled) return;
    enabled = true;
    resetState();
    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    resetState();
    container.removeEventListener("scroll", onScroll);
    container.removeEventListener("touchstart", onTouchStart);
  }

  // 初始
  if (window.matchMedia(MOBILE_MEDIA).matches) enable();

  // 尺寸变化时动态切换
  const mql = window.matchMedia(MOBILE_MEDIA);
  const onChange = (e) => (e.matches ? enable() : disable());
  if (mql.addEventListener) {
    mql.addEventListener("change", onChange);
  } else {
    mql.addListener(onChange);
  }
})();

// Main entry point - load story and initialize the application
fetch("story.json")
  .then((response) => response.json())
  .then((storyContent) => {
    try {
      // Initialize the story manager which handles everything
      window.storyManager = new StoryManager(storyContent);

      // Optional: expose for debugging in development
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        window.debug = {
          story: window.storyManager.story,
          display: window.storyManager.display,
          saves: window.storyManager.saves,
          settings: window.storyManager.settings,
          errors: window.errorManager,
          getStats: () => window.storyManager.getStats(),
          getFeatureInfo: () => window.storyManager.getFeatureInfo(),
        };
        console.log("Debug tools available in window.debug");
      }
    } catch (error) {
      window.errorManager.critical(
        "故事管理器初始化失败",
        error,
        "story",
      );
      showFallbackUI(error);
    }
  })
  .catch((error) => {
    window.errorManager.critical("无法加载故事文件", error, "story");
    showFallbackUI(error);
  });

// Show fallback UI when story fails to load
function showFallbackUI(error) {
  const storyContainer = document.getElementById("story");
  if (!storyContainer) return;

  storyContainer.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-important);">
      <h2>⚠️ 故事加载错误</h2>
      <p>无法加载故事，请查看浏览器控制台（F12）获取详情。</p>
      <div style="margin: 2rem 0;">
        <button onclick="window.location.reload()" style="
          background: var(--color-accent-primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 1rem;
          font-size: 1rem;
        ">刷新页面</button>
        <button onclick="showConsoleHelp()" style="
          background: var(--color-border-medium);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-medium);
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        ">如何查看控制台</button>
      </div>
      <details style="margin-top: 1rem; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
        <summary style="cursor: pointer; font-weight: 600;">技术细节</summary>
        <div style="background: var(--color-code-bg); padding: 1rem; border-radius: 4px; margin-top: 0.5rem; font-family: monospace; font-size: 0.8rem; overflow-x: auto;">
          错误：${error.message}<br>
          时间：${new Date().toLocaleString()}<br>
          ${error.stack ? `调用栈：${error.stack}` : ""}
        </div>
      </details>
    </div>
  `;
}

// Help users find the console
function showConsoleHelp() {
  alert(`查看控制台以获取错误详情：

• Chrome/Edge：按 F12 或 Ctrl+Shift+I，然后点击"Console"
• Firefox：按 F12 或 Ctrl+Shift+K
• Safari：按 Cmd+Option+I（Mac），然后点击"Console"
• 移动端：控制台不易访问，建议在电脑上查看

寻找显示问题原因的红色错误信息。`);
}

// Keyboard shortcuts for power users
document.addEventListener("keydown", (event) => {
  // Only handle shortcuts if story manager is initialized
  if (!window.storyManager) return;

  // Don't interfere with normal typing in inputs
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  // Ctrl/Cmd + shortcuts
  if (event.ctrlKey || event.metaKey) {
    try {
      switch (event.key) {
        case "s":
          event.preventDefault();
          window.storyManager.saves?.showSaveDialog?.();
          break;

        case "r":
          event.preventDefault();
          if (confirm("确定从头重启故事吗？")) {
            window.storyManager.restart();
          }
          break;

        case ",":
          event.preventDefault();
          window.storyManager.settings?.showSettings?.();
          break;
      }
    } catch (error) {
      window.errorManager.error(
        "快捷键操作失败",
        error,
        "navigation",
      );
    }
  }

  // Escape key - return from special pages
  if (
    event.key === "Escape" &&
    window.storyManager.pages?.isViewingSpecialPage?.()
  ) {
    try {
      window.storyManager.pages.returnToStory();
    } catch (error) {
      window.errorManager.error(
        "从特殊页面返回失败",
        error,
        "navigation",
      );
    }
  }
});

// Make showConsoleHelp available globally for the fallback UI
window.showConsoleHelp = showConsoleHelp;
