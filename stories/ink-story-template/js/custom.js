/* =============================================================================
   CUSTOM JAVASCRIPT
   =============================================================================
   
   This file is for YOUR custom JavaScript. It loads AFTER the template's
   core scripts, so all template functionality is available.
   
   The template's core JS (template.min.js) is minified and shouldn't be
   edited directly. Use this file instead!
   
   ============================================================================= */

/* =============================================================================
   LIFECYCLE HOOKS
   =============================================================================
   
   The template fires custom events you can listen for. Use these to run
   code at specific points in the story.
   
   Available events:
   - story:start   - Story first loads (fires once)
   - story:content - New content displayed (fires on each passage)
   - story:choice  - Player makes a choice
   - story:end     - Story ends (no more content or choices)
   - story:restart - Story restarts
   
   ============================================================================= */

/**
 * Called when the story first loads and is ready.
 * Use this for one-time setup.
 */
// document.addEventListener("story:start", function () {
//   console.log("Story started!");
// });

/**
 * Called every time new story content is displayed.
 * event.detail.content contains the array of content objects.
 */
// document.addEventListener("story:content", function (event) {
//   console.log("New content:", event.detail.content);
// });

/**
 * Called when the player makes a choice.
 * event.detail.index contains the choice index (0-based).
 */
// document.addEventListener("story:choice", function (event) {
//   console.log("Player chose option:", event.detail.index);
// });

/**
 * Called when the story ends (no more content or choices).
 * Use this for end screens, achievements, etc.
 */
// document.addEventListener("story:end", function () {
//   console.log("Story ended!");
// });

/**
 * Called when the story restarts.
 * Use this to reset any custom state.
 */
// document.addEventListener("story:restart", function () {
//   console.log("Story restarted!");
// });

/* =============================================================================
   HELPER FUNCTIONS
   =============================================================================
   
   Some example helper functions you might find useful. Uncomment and modify
   as needed.
   
   ============================================================================= */

/**
 * Example: Show a custom notification
 * Uses the template's built-in notification system.
 *
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 */
// function showNotification(message, type = "info") {
//   if (window.InkTemplate.notificationManager) {
//     window.InkTemplate.notificationManager.show(message, type);
//   }
// }

/**
 * Example: Get a story variable value
 * Useful for conditional logic based on story state.
 *
 * @param {string} varName - The Ink variable name
 * @returns {*} The variable value, or undefined if not found
 */
// function getStoryVariable(varName) {
//   if (window.InkTemplate.storyManager && window.InkTemplate.storyManager.story) {
//     return window.InkTemplate.storyManager.story.variablesState[varName];
//   }
//   return undefined;
// }

/**
 * Example: Set a story variable
 * Allows you to modify story state from JavaScript.
 *
 * @param {string} varName - The Ink variable name
 * @param {*} value - The new value
 */
// function setStoryVariable(varName, value) {
//   if (window.InkTemplate.storyManager && window.InkTemplate.storyManager.story) {
//     window.InkTemplate.storyManager.story.variablesState[varName] = value;
//   }
// }

/* =============================================================================
   YOUR CUSTOM CODE
   =============================================================================
   
   Add your custom JavaScript below. Some ideas:
   
   - Custom animations
   - Sound effects tied to story events
   - Integration with external services
   - Custom UI elements
   
   ============================================================================= */

/* =============================================================================
   自定义 Ink 外部函数注册表
   -----------------------------------------------------------------------------
   在 .ink 脚本顶部声明后即可在故事中使用, 例如:
       EXTERNAL GET_POEM(theme)
       {GET_POEM("雨夜")}
   这里登记的函数会在故事(含临时故事/读档)创建时自动绑定。
   新增函数: 直接向下面的对象里加 "函数名(参数){ ... }" 即可。
   ============================================================================= */

window.INK_CUSTOM_EXTERNALS = {
  /**
   * GET_POEM(theme): 按题材返回一首小诗
   * theme 命中关键词则返回对应诗作, 都不命中返回默认篇。
   */
  GET_POEM(theme) {
    const poems = [
      { keys: ["猫"], text: "梁间猫影瘦，夜半叫声寒。瞪目窥灯处，疑逢旧主还。" },
      { keys: ["雪"], text: "雪落千山静，云低一径深。行人留去住，炉火正堪温。" },
      { keys: ["酒"], text: "浊酒温寒夜，微醺话旧游。举杯邀雨听，一醉解千愁。" },
      { keys: ["信", "笺"], text: "残信炉边烬，相思火里销。故人名半在，不敢读终宵。" },
      { keys: ["旅", "客", "行"], text: "雨夜投荒店，衣单抱匣深。莫言身世事，炉畔且宽心。" },
      { keys: ["楼", "阁"], text: "阁楼声寂寂，疑是故人归。蹑足听良久，空阶月影微。" },
      { keys: ["门", "敲"], text: "夜半敲门急，灯前问客谁。借牌非为赌，风雪阻归期。" },
      { keys: ["灯"], text: "孤灯挑未尽，照壁影迟迟。窗外潇潇雨，人间夜半时。" },
      { keys: ["雨"], text: "细雨湿青瓦，寒窗入夜凉。一声檐滴里，客梦到潇湘。" },
      { keys: ["夜", "更"], text: "更深灯影小，风静竹声幽。独有未眠客，披衣数更筹。" },
    ];
    const t = String(theme ?? "");
    for (const p of poems) {
      if (p.keys.some((k) => t.includes(k))) return p.text;
    }
    return "云深不知处，雨夜且安眠。故事炉边起，明朝又一天。";
  },
};

/* =============================================================================
   阅读体验优化:选项跳转分隔线 + 平滑滚动锚定
   =============================================================================
   玩家点击选项后:
   1. story:choice — 在选项容器位置插入一条横线(标记"已读/新读"分界)
   2. story:content — 新正文渲染完成后,平滑滚动把横线提升到正文框上边缘
   效果:视线从上次阅读位置自然过渡到新内容,无需手动找位置。
   ============================================================================= */

(function () {
  // 玩家点击选项(捕获阶段,早于模板的渲染逻辑):
  // 此时旧选项容器还在,插横线到它前面 —— 新内容将渲染在横线之后
  document.addEventListener("click", function (e) {
    const choice = e.target.closest && e.target.closest(".choice");
    if (!choice) return;

    const story = document.querySelector("#story");
    if (!story) return;

    const hr = document.createElement("hr");
    hr.className = "story-divider";
    hr.setAttribute("aria-hidden", "true");

    const choices = story.querySelector(".choices-container");
    if (choices) {
      story.insertBefore(hr, choices);
    } else {
      story.appendChild(hr);
    }
    watchNewContent(hr);
  }, true);

  // 观察选择后的新增节点:淡入+上移动画;内容稳定后平滑滚动锚定
  function watchNewContent(hr) {
    const story = document.querySelector("#story");
    if (!story) return;

    // 给单个元素挂进入动画(淡入 + 轻微上移)
    function addEnter(target) {
      if (target.nodeType !== 1) return;
      if (target.classList.contains("choices-container")) return; // 选项不做位移动画
      if (target.classList.contains("story-divider")) return;
      target.classList.add("content-enter");
      target.addEventListener("animationend", function handler() {
        target.classList.remove("content-enter");
        target.removeEventListener("animationend", handler);
      });
    }

    // 150ms 无新增节点视为渲染完成 → 平滑滚动到横线
    let settleTimer = null;
    function scheduleScroll() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        observer.disconnect();
        hr.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }

    const observer = new MutationObserver(function (mutations) {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          addEnter(node);
          // 容器节点:内容段落也挂上
          if (node.children) {
            for (const child of node.children) addEnter(child);
          }
        }
      }
      scheduleScroll();
    });
    observer.observe(story, { childList: true, subtree: true });

    scheduleScroll();
  }
})();
