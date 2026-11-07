// ==============================================================================
//  STORY SETTINGS
//  Central configuration for the currently loaded story. Edit this file to
//  change the title, author, synopsis, cast list, or which .lor script loads.
//  Exposed as window.STORY_SETTINGS so app.js can read it.
// ==============================================================================

window.STORY_SETTINGS = {
  // Displayed in the top menu bar and page <title>
  title: '审讯室：30 分钟',
  author: 'Loreline Studio',

  // 剧情介绍 — shown in the "剧情介绍" menu dialog. 登场人物列在末尾。
  synopsis: '某冶金研究所的核心机密——新型航空发动机叶片合金配方，在三天前被通过网络窃取。数据量约 2.3GB，涉及十七项专利。一旦流出境外，损失以百亿计，且直接威胁国防安全。\n\n登场人物：小洁、南合治',

  // 关于 — shown in the "关于" menu dialog. Blank lines ("\n\n") render as paragraphs.
  about: 'Loreline Studio 是一个专注于互动叙事的创作小组，作品多以"选择与代价"为主题。\n\n《审讯室：30 分钟》的创作意图，是让玩家在有限的时间与有限的证据之间反复权衡"强硬"与"共情"：审讯不是解密，没有标准答案，只有取舍。',

  // Which .lor script to load. Put the file in the story/ folder and write any
  // name here — the ".lor" extension is optional, so all of these work:
  //   'StoryText.lor'   '互动续诗.lor'   '互动续诗'   'story/互动续诗.lor'
  storyFile: 'Text.lor',

  // Copyright line shown in the footer
  copyright: '© 2026 Loreline. All rights reserved.'
};
