
// ==============================================================================
//  LORELINE WEB SAMPLE: Reference Implementation
//
//  This file demonstrates how to integrate the Loreline runtime into a web
//  page. It loads a .lor script, plays it, and renders dialogue, narrative
//  text, and interactive choices with smooth animations.
//
//  The display matches the Loreline website playground preview.
// ==============================================================================

// Loreline engine is the official runtime (loreline.js) — loaded as an ES module
// via import below. Story metadata comes from setting.js (window.STORY_SETTINGS).
import { Loreline } from './loreline.js';

const SETTINGS = window.STORY_SETTINGS || {};

// ==============================================================================
//  DOM REFERENCES
// ==============================================================================

const output = document.getElementById('output');

// Story title and author are rendered at the top of the story body (see startStory).
// Page <title> is still set here.
document.title = (SETTINGS.title || 'Loreline') + (SETTINGS.author ? ' — ' + SETTINGS.author : '');

// Footer credits from settings. 登场人物 / 故事创作者 moved to the top menu
// (see the modal wiring below); only the organization and copyright stay here.
(function buildFooter() {
  const meta = document.getElementById('footer-meta');
  if (SETTINGS.copyright) meta.textContent = SETTINGS.copyright;
})();

// ------------------------------------------------------------------------------
// Top menu: 登场人物 / 剧情介绍 / 关于 — each opens the shared modal dialog with
// content pulled from setting.js (window.STORY_SETTINGS).
// ------------------------------------------------------------------------------
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
let lastFocused = null;

/** Splits text on blank lines into <p> elements (keeps single newlines). */
function textBlock(text) {
  const frag = document.createDocumentFragment();
  String(text).split(/\n{2,}/).forEach(function (para) {
    const p = document.createElement('p');
    p.textContent = para;
    frag.appendChild(p);
  });
  return frag;
}

/**
 * Opens the modal with a title and body node.
 * @param {string} title - Dialog heading
 * @param {Node} bodyNode - Content to display
 */
function openModal(title, bodyNode) {
  lastFocused = document.activeElement;
  modalTitle.textContent = title;
  modalBody.innerHTML = '';
  modalBody.appendChild(bodyNode);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('modal-close').focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

document.getElementById('modal-close').addEventListener('click', closeModal);
// Click on the dimmed backdrop (outside the dialog) closes it
modal.addEventListener('click', function (e) {
  if (e.target === modal) closeModal();
});
// Esc closes the dialog
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

document.getElementById('btn-synopsis').addEventListener('click', function () {
  openModal('剧情介绍', textBlock(SETTINGS.synopsis || '（暂无剧情介绍）'));
});

document.getElementById('btn-about').addEventListener('click', function () {
  const wrap = document.createElement('div');
  wrap.appendChild(textBlock(SETTINGS.about || '（暂无关于信息）'));
  if (SETTINGS.author || SETTINGS.organization) {
    const org = document.createElement('div');
    org.className = 'about-org';
    org.textContent = '故事创作者：' + (SETTINGS.author || SETTINGS.organization);
    wrap.appendChild(org);
  }
  openModal('关于', wrap);
});

// Top menu bar: restart button reloads the story from the beginning
document.getElementById('btn-restart').addEventListener('click', function () {
  startStory();
});

// Theme toggle: switch between light (default) and dark, persist in localStorage
const themeBtn = document.getElementById('btn-theme');
function syncThemeButton() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeBtn.textContent = isDark ? '☀️ 浅色' : '🌙主题';
}
syncThemeButton();
themeBtn.addEventListener('click', function () {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('loreline-theme', next);
  syncThemeButton();
});


// ==============================================================================
//  SCROLL-STABLE TABLE LAYOUT
//
//  We build a two-column CSS table inside the output container. The table is
//  centered with a max-width for comfortable reading, while the output div
//  spans the full viewport width (so the scrollbar sits at the window edge):
//    - The "content" column holds all story output (narrative, dialogue, choices)
//    - The "keeper" column is zero-width but its height only ever increases
//
//  This prevents scroll jumps: when choice buttons are hidden after selection,
//  the keeper column maintains the previous maximum height, so the scrollable
//  area never shrinks unexpectedly.
// ==============================================================================

const tableWrap = document.createElement('div');
tableWrap.className = 'output-table';

const contentCol = document.createElement('div');
contentCol.className = 'output-content';

const keeperCell = document.createElement('div');
keeperCell.className = 'output-keeper-cell';

const heightKeeper = document.createElement('div');
heightKeeper.className = 'output-keeper';

keeperCell.appendChild(heightKeeper);
tableWrap.appendChild(contentCol);
tableWrap.appendChild(keeperCell);
output.appendChild(tableWrap);


// ==============================================================================
//  TIMER MANAGEMENT
//
//  All setTimeout calls used for animation sequencing are tracked here so they
//  can be cancelled when restarting the story (prevents orphaned callbacks).
// ==============================================================================

let pendingTimers = [];

/**
 * Cancels all pending animation/delay timers.
 * Called when clearing the output to restart the story.
 */
function clearTimers() {
  for (const id of pendingTimers) clearTimeout(id);
  pendingTimers = [];
}


// ==============================================================================
//  ANIMATION HELPERS
// ==============================================================================

/**
 * Fades in an element with a subtle upward slide.
 *
 * Uses JS-driven transitions (not CSS @keyframes) so we can control the
 * timing per-element and trigger the animation at the exact moment the
 * element is appended to the DOM.
 *
 * @param {HTMLElement} el - The element to animate in
 */
function fadeIn(el) {
  // Start invisible and shifted down slightly
  el.style.animation = 'none';
  el.style.display = '';
  el.style.opacity = '0';
  el.style.transform = 'translateY(4px)';

  // Force a reflow so the browser registers the starting state
  el.offsetHeight;

  // Transition to visible and in-place
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
}

/**
 * Updates the height keeper to the current content height.
 *
 * The keeper's height only ever increases (never shrinks). This is the key
 * mechanism that prevents scroll position jumps when choice buttons are
 * removed from the layout after selection.
 */
function updateHeightKeeper() {
  const h = contentCol.offsetHeight;
  if (h > (parseInt(heightKeeper.style.height, 10) || 0)) {
    heightKeeper.style.height = h + 'px';
  }
}

/**
 * Smoothly scrolls the output container to the bottom.
 *
 * Uses requestAnimationFrame for a buttery-smooth eased animation.
 * The duration scales with the scroll distance (min 250ms, max 600ms)
 * and uses a quadratic ease-in-out curve.
 */
let scrollAnim = null;

function scrollToBottom() {
  if (scrollAnim) cancelAnimationFrame(scrollAnim);

  const start = output.scrollTop;
  const target = output.scrollHeight - output.clientHeight;

  // Don't scroll if we're already at the bottom
  if (target <= start) return;

  const dist = target - start;
  const t0 = performance.now();
  const duration = Math.min(600, Math.max(250, dist * 1.2));

  (function step(now) {
    const t = Math.min(1, (now - t0) / duration);

    // Quadratic ease-in-out: smooth acceleration then deceleration
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    output.scrollTop = start + dist * ease;

    if (t < 1) scrollAnim = requestAnimationFrame(step);
    else scrollAnim = null;
  })(t0);
}

/**
 * Smoothly scrolls the output so that the given element sits at the top
 * of the visible area (with a small top padding). Used after a choice is
 * made so the chosen box becomes the new "reading top" and the player
 * doesn't have to manually scroll down for new content.
 *
 * @param {HTMLElement} el - The element to bring to the top
 * @param {function} [onDone] - Called once the scroll animation finishes
 */
function scrollToTopOfView(el, onDone) {
  if (scrollAnim) cancelAnimationFrame(scrollAnim);

  const outputRect = output.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const paddingTop = 18; // breathing room above the element
  const target = output.scrollTop + (elRect.top - outputRect.top) - paddingTop;

  const start = output.scrollTop;
  const dist = target - start;

  if (Math.abs(dist) < 1) {
    if (onDone) onDone();
    return;
  }

  const t0 = performance.now();
  const duration = Math.min(700, Math.max(300, Math.abs(dist) * 1.0));

  (function step(now) {
    const t = Math.min(1, (now - t0) / duration);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    output.scrollTop = start + dist * ease;
    if (t < 1) scrollAnim = requestAnimationFrame(step);
    else {
      scrollAnim = null;
      if (onDone) onDone();
    }
  })(t0);
}


// ==============================================================================
//  OUTPUT MANAGEMENT
// ==============================================================================

/**
 * Clears all story output and resets the height keeper.
 * Called when restarting the story.
 */
function clearOutput() {
  clearTimers();
  contentCol.innerHTML = '';
  heightKeeper.style.height = '0px';
}


// ==============================================================================
//  RENDERING: Dialogue & Narrative
// ==============================================================================

/**
 * Appends a line of dialogue or narrative text to the output.
 *
 * - If `character` is non-null, renders as dialogue:
 *     <div class="preview-line dialogue">
 *       <span class="char-name">Character : </span>
 *       <span class="dialogue-text">What they said</span>
 *     </div>
 *
 * - If `character` is null, renders as narrative:
 *     <div class="preview-line narrative">Narrator text here</div>
 *
 * The character name separator uses Unicode thin spaces for refined typography:
 *   \u2009 (thin space) + : + \u2004 (three-per-em space) + \u200a (hair space)
 *
 * @param {string|null} character - Character name, or null for narrative
 * @param {string} text - The text content to display
 */
function appendDialogue(character, text) {
  const line = document.createElement('div');

  if (character) {
    line.className = 'preview-line dialogue';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'char-name';
    nameSpan.textContent = character + '\u2009:\u2004\u200a';

    const textSpan = document.createElement('span');
    textSpan.className = 'dialogue-text';
    textSpan.textContent = text;

    line.appendChild(nameSpan);
    line.appendChild(textSpan);
  } else {
    line.className = 'preview-line narrative';
    line.textContent = text;
  }

  contentCol.appendChild(line);
  fadeIn(line);
  updateHeightKeeper();
  scrollToBottom();
}


// ==============================================================================
//  RENDERING: Choices (Ink-style text links)
//
//  When the player selects a choice, a 2-phase animation plays:
//
//    Phase 1 (immediate):
//      The selected link gets the "chosen" class (becomes muted regular text).
//      All other links get the "fading" class (fade to transparent).
//
//    Phase 2 (after 350ms):
//      The faded links get "hidden" (display: none). The chosen link stays
//      inline as part of the story text. The Loreline callback is invoked.
// ==============================================================================

/**
 * Renders choice buttons and handles selection with animated transitions.
 *
 * @param {Array<{text: string, enabled: boolean}>} options - Choice options from Loreline
 * @param {function(number): void} choiceCallback - Called with the selected index
 */
function showChoices(options, choiceCallback) {
  const choiceContainer = document.createElement('div');
  choiceContainer.className = 'preview-choices';
  const buttons = [];

  for (let i = 0; i < options.length; i++) {
    const idx = i;
    const btn = document.createElement('button');
    btn.className = 'preview-choice';
    btn.textContent = options[idx].text;

    // Skip disabled choices (they won't have click handlers)
    if (options[idx].enabled === false) continue;

    btn.addEventListener('click', function () {
      // Prevent double-clicks during animation
      if (choiceContainer.querySelector('.preview-choice.chosen')) return;

      // -- Phase 1: Mark chosen, fade the others --
      for (const b of buttons) {
        if (b === btn) {
          b.classList.add('chosen');
        } else {
          b.classList.add('fading');
        }
      }

      // -- Phase 2: remove faded choices, scroll chosen to top, then continue --
      pendingTimers.push(setTimeout(function () {
        // Remove the non-chosen choice boxes from layout
        for (const b of buttons) {
          if (b !== btn) b.classList.add('hidden');
        }

        updateHeightKeeper();
        // Bring the chosen choice to the top of the viewport first; only
        // continue the story once the scroll finishes, so the dialogue's
        // scrollToBottom doesn't override the scroll-to-top animation.
        scrollToTopOfView(btn, function () {
          choiceCallback(idx);
        });
      }, 400));
    });

    buttons.push(btn);
    choiceContainer.appendChild(btn);
  }

  contentCol.appendChild(choiceContainer);
  fadeIn(choiceContainer);
  updateHeightKeeper();
  scrollToBottom();
}


// ==============================================================================
//  RENDERING: Story Finished
// ==============================================================================

/**
 * Shows a "Play Again" button after the story ends.
 * The button appears with a 500ms delay and a fade-in animation.
 */
function showFinished() {
  const resetBtn = document.createElement('button');
  resetBtn.className = 'preview-reset';
  resetBtn.textContent = 'Play again 重新开始';
  resetBtn.addEventListener('click', function () {
    startStory();
  });

  contentCol.appendChild(resetBtn);

  // Initially hidden, then fades in after a brief pause
  resetBtn.style.display = 'none';
  pendingTimers.push(setTimeout(function () {
    fadeIn(resetBtn);
    scrollToBottom();
  }, 500));
}


// ==============================================================================
//  LORELINE INTEGRATION
//
//  This section shows the canonical pattern for running a Loreline script
//  in a web page:
//
//    1. Fetch the .lor file content
//    2. Parse it with Loreline.parse(), providing an import handler for
//       any "import" statements in the script
//    3. Play it with Loreline.play(), providing three handler callbacks:
//       - handleDialogue: called for each line of text (narrative or dialogue)
//       - handleChoice:   called when the player must pick from options
//       - handleFinish:   called when the script reaches the end
//
//  Each handler receives a callback that MUST be called to advance the
//  script. This gives you full control over pacing (e.g., adding delays,
//  waiting for user interaction, or playing animations between lines).
// ==============================================================================

/**
 * Import handler for Loreline's "import" statements.
 *
 * When a .lor script contains `import characters`, Loreline calls this
 * function to load the file. We fetch it from the story/ subfolder.
 *
 * @param {string} path - The file path to load (e.g., "characters.lor")
 * @param {function(string): void} callback - Call with the file contents
 */
function handleFile(path, callback) {
  // Loreline import paths omit the extension (e.g. "characters"), but the
  // actual files on disk have a ".lor" suffix. Append it if missing.
  const file = path.endsWith('.lor') ? path : path + '.lor';
  fetch('story/' + file)
    .then(r => r.ok ? r.text() : '')
    .then(data => callback(data))
    .catch(() => callback(''));
}

/**
 * Loreline dialogue handler.
 *
 * Called for every line of text in the script, both narrative (character
 * is null) and dialogue (character is the speaker's name).
 *
 * We display the text immediately and auto-advance after a 600ms delay,
 * giving the player time to read each line before the next one appears.
 *
 * @param {object} interpreter - The Loreline interpreter instance
 * @param {string|null} character - Speaker name, or null for narrative
 * @param {string} text - The text content
 * @param {Array} tags - Any inline tags (not used in this sample)
 * @param {function} callback - MUST call to advance the script
 */
function handleDialogue(interpreter, character, text, tags, callback) {
  // Resolve the character's display name from their fields if available
  let displayName = character;
  if (character) {
    try {
      const n = interpreter.getCharacterField(character, 'name');
      if (n) displayName = n;
    } catch (e) { /* Use original name as fallback */ }
  }

  appendDialogue(displayName, text);

  // Auto-advance after a short delay so lines appear sequentially
  pendingTimers.push(setTimeout(function () {
    try { callback(); } catch (e) { showError(e); }
   }, 150));
}

/**
 * Loreline choice handler.
 *
 * Called when the script presents the player with choices. We show
 * the choice buttons after a brief delay (500ms) for pacing.
 *
 * @param {object} interpreter - The Loreline interpreter instance
 * @param {Array<{text: string, enabled: boolean}>} options - Available choices
 * @param {function(number): void} callback - Call with the chosen index
 */
function handleChoice(interpreter, options, callback) {
  pendingTimers.push(setTimeout(function () {
    showChoices(options, function (idx) {
      try { callback(idx); } catch (e) { showError(e); }
    });
  }, 200));
}

/**
 * Loreline finish handler.
 *
 * Called when the script reaches the end. We show a "Play Again" button
 * so the player can restart the story.
 *
 * @param {object} interpreter - The Loreline interpreter instance
 */
function handleFinish(interpreter) {
  showFinished();
}

/**
 * Displays a runtime error in the output area.
 *
 * @param {Error} e - The error to display
 */
function showError(e) {
  const errLine = document.createElement('div');
  errLine.className = 'preview-line narrative';
  errLine.style.color = '#ff6b6b';
  errLine.textContent = e.message || String(e);
  contentCol.appendChild(errLine);
  fadeIn(errLine);
  updateHeightKeeper();
  scrollToBottom();
}


// ==============================================================================
//  STORY LOADER
// ==============================================================================

/**
 * Normalizes the story file name from settings into a file under story/.
 *
 * Accepts any name, with or without the ".lor" extension, and tolerates a
 * leading "story/" prefix — so all of these resolve to the same file:
 *   'StoryText.lor'  '互动续诗.lor'  '互动续诗'  'story/互动续诗.lor'
 *
 * @param {string} name - The configured story file name
 * @returns {string} The normalized file name (always ends with ".lor")
 */
function resolveStoryFile(name) {
  const file = String(name || 'StoryText.lor')
    .trim()
    .replace(/^\.?\/?story\//i, '');
  return file.endsWith('.lor') ? file : file + '.lor';
}

/**
 * Starts (or restarts) the story.
 *
 * Loads the .lor script named in SETTINGS.storyFile from the story/ folder,
 * parses it with import support, and begins playback.
 */
function startStory() {
  clearOutput();

  // Story title and author rendered at the top of the body
  const header = document.createElement('div');
  header.className = 'story-header';
  if (SETTINGS.title) {
    const h = document.createElement('h2');
    h.textContent = SETTINGS.title;
    header.appendChild(h);
  }
  if (SETTINGS.author) {
    const a = document.createElement('p');
    a.textContent = '作者：' + SETTINGS.author;
    header.appendChild(a);
  }
  contentCol.appendChild(header);
  updateHeightKeeper();
  scrollToBottom();

  const storyFile = resolveStoryFile(SETTINGS.storyFile);
  fetch('story/' + storyFile)
    .then(r => {
      if (!r.ok) throw new Error('无法加载故事文件：story/' + storyFile);
      return r.text();
    })
    .then(content => {
      // Parse with file path + import handler (async imports -> use callback)
      Loreline.parse(content, storyFile, handleFile, function (script) {
        Loreline.play(script, handleDialogue, handleChoice, handleFinish);
      });
    })
    .catch(e => showError(e));
}

// Start the story when the page loads
startStory();
