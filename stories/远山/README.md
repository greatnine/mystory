# Loreline Web

基于 [Loreline](https://loreline.app) 叙事引擎的 Web 端参考实现。加载并运行 `.lor` 互动小说脚本，渲染叙述、对话与分支选项。

## 目录结构

```
loreline-web/
├── index.html          # 入口页面
├── README.md
├── run-node.bat        # Windows 一键启动
├── start-server.js     # 零依赖 Node 静态服务器（开浏览器 + Ctrl+C 优雅关闭）
├── src/                # 应用源码
│   ├── app.js          # 渲染与 Loreline 接入（ES module）
│   ├── setting.js      # 故事元数据（标题、作者、简介、角色、入口脚本）
│   ├── styles.css      # 主题与布局样式
│   ├── favicon.ico
│   └── loreline.js     # Loreline 引擎（Haxe 编译产物，只读，勿改）
├── fonts/              # 自托管字体
│   ├── literata-italic-latin.woff2
│   ├── outfit-latin.woff2
│   ├── 亚洲.ttf
│   ├── 植物.ttf
│   └── 音乐.ttf
└── story/              # .lor 脚本
    └── StoryText.lor   # 默认入口脚本
```

## 快速开始

需安装 [Node.js](https://nodejs.org/)。双击 `run-node.bat`，或：

```bash
node start-server.js
```

服务器默认监听 `3000` 端口，若被占用则自动回退到系统分配端口，控制台会打印访问地址。`Ctrl+C` 优雅关闭并释放端口。

> 不要用 `file://` 直接打开 `index.html`——脚本通过 `fetch()` 加载 `story/*.lor`，需 HTTP 服务器。

## 工作原理

```js
fetch('story/StoryText.lor')
  .then(r => r.text())
  .then(content => {
    Loreline.parse(content, 'StoryText.lor', handleFile, script => {
      Loreline.play(script, handleDialogue, handleChoice, handleFinish);
    });
  });
```

`Loreline.play()` 的三个回调均需调用回调推进脚本：

| 回调 | 触发时机 |
|------|----------|
| `handleDialogue(interpreter, character, text, tags, cb)` | 每行文本（`character` 为 null 即叙述） |
| `handleChoice(interpreter, options, cb)` | 分支选项，用选中 index 回调 |
| `handleFinish(interpreter)` | 脚本结束 |

`interpreter.getCharacterField(char, 'name')` 读取角色字段做显示名映射。

### 渲染层要点

- 浅色 / 深色双主题（默认浅色），角色名用粉紫蓝渐变文字
- 逐行淡入，选项三阶段动画（高亮 → 其余渐隐 → 滑顶并隐藏）
- CSS table 双列布局 + 零宽高度守护者，防止选项隐藏后滚动跳动
- `requestAnimationFrame` 平滑滚动到底部

## .lor 语法速查

```lor
import characters

character barista
  name: Barista
  friendship: 0

state
  specialBeans: 8

beat CoffeeShop
  player.cafeVisits += 1
  The aroma of coffee fills the air.        // 叙述
  barista: <friendly> Ready to order?       // 对话 + 情绪标签

  choice
    Order espresso                          // 选项
      player.energy += 2
      -> ProcessCoffeeEffects               // 跳转 beat
    Order special if specialBeans > 0       // 条件选项
      specialBeans -= 1
      -> ProcessCoffeeEffects

  if player.consumedCoffees > 3             // 条件分支
    barista: <concerned> Again?

  pick                                      // 随机选一条
    The coffee kicks in.
  --
    The caffeine does its work.

  chance(4)                                 // 1/4 概率
    sarah.present = true
```

完整示例见 [story/StoryText.lor](story/StoryText.lor)。

## 切换故事

把 `.lor` 脚本放进 `story/`，再修改 `src/setting.js` 里的 `storyFile` —— 文件名任意，`.lor` 扩展名可省略：

```js
storyFile: 'StoryText.lor',   // 也可写 '互动续诗.lor' / '互动续诗' / 'story/互动续诗.lor'
```

## 技术栈

- **运行时**：`loreline.js` 由 Haxe 4.3.7 编译，导出 `Loreline` / `Interpreter` / `Node` / `Script`
- **服务器**：仅用 Node 内置模块，无外部依赖
- **字体**：latin 子集；中文自动回退到系统衬线/无衬线字体
