# Web App 书斋

测试 web app 在浏览器中的表现。一个面向写作爱好者创作 IF（互动小说）的轻量测试入口。

---

## 项目结构

```
网页测试/
├── stories-manifest.py        # 扫描 dist/stories/ → 自动生成 JSON 清单
├── 启动服务器.ps1             # 一键启动：生成清单 + 启动服务器（推荐，PowerShell）
├── 启动服务器.bat             # 一键启动：CMD 版（纯英文，避免编码问题）
├── dist/                      # 发布目录（所有网页内容都在这里）
│   ├── index.html             # 主页（书架入口）
│   ├── style.css              # 书架/书封样式
│   ├── app-test.js            # 双模式获取故事列表 + 动态渲染
│   ├── stories-manifest.json  # 故事目录清单（由 stories-manifest.py 自动生成）
│   └── stories/               # 故事目录（每个子目录 = 一个故事）
│       ├── story1/
│       │   ├── index.html     # 故事入口（必需）
│       │   └── images/
│       │       └── cover.jpg  # 书封（可选）
│       ├── twineIF/
│       │   ├── index.html
│       │   └── images/
│       │       └── cover.webp
│       ├── 凌霄錄/
│       │   └── index.html
│       └── ...
├── README.md                  # 本文件
├── prompt.txt
└── requirements.md
```

---

## 功能

- **双模式自动获取故事列表**：
  - **模式 A（推荐）**：读取 `dist/stories-manifest.json` — 适合 GitHub Pages 等静态托管
  - **模式 B**：扫描 `dist/stories/` 目录 — 适合本地 Python 服务器（带目录索引的 http.server）
- **自动生成 manifest**：`stories-manifest.py` 会扫描 `dist/stories/` 目录并生成 `dist/stories-manifest.json`，**零手动维护**
- **书架式布局**：每个故事显示为一本小书（书名 + 装饰性书脊）
- **自动检测封面**：若子目录内存在 `images/cover.webp/jpg/jpeg/png`，则作为该书封面显示
- **自动检测入口**：检测每个子目录下是否存在 `index.html`，缺失时标记为"不可点"
- **一键访问故事**：点击书名即打开故事的 `index.html`，浏览器"后退"即可返回主页
- **双端适配**：PC 宽屏多列、手机两列，均可正常显示
- **异步渲染**：无需等待全部目录检测完成即显示卡片

---

## 使用方式

### 方法一：一键启动（推荐）

1. 将故事以独立文件夹形式放在 `dist/stories/` 目录下。
2. 每个故事文件夹内需包含一个 `index.html` 作为入口。
3. **右键 `启动服务器.ps1` → "使用 PowerShell 运行"** （或双击）
4. 浏览完毕后，在 PowerShell 窗口按 **Enter** 停止服务器。

> `.ps1` 对中文目录名和中文输出都处理得很稳定，是推荐方式。

### 方法二：CMD 版启动

双击 `启动服务器.bat` — 自动执行两步：
1. 运行 `stories-manifest.py` 扫描 `dist/stories/`，生成/更新 `dist/stories-manifest.json`
2. 进入 `dist/` 目录启动 `python -m http.server 8000`，并在浏览器打开主页

浏览完毕后，在 CMD 窗口按 **Ctrl+C** 停止服务器。

### 方法三：手动启动

在项目目录下打开 PowerShell/CMD：

```bash
# 1. 生成/更新清单
python stories-manifest.py

# 2. 进入 dist/ 启动服务器
cd dist
python -m http.server 8000
```

然后浏览器访问 `http://localhost:8000/index.html`。

---

## 新增故事

在 `dist/stories/` 下新建一个目录，包含 `index.html` 即可：

```
dist/stories/
└── 我的新故事/
    ├── index.html        ← 必需（故事入口）
    └── images/
        └── cover.jpg     ← 可选（书封图片，不提供则显示默认书封）
```

**下一步**：重新运行 `启动服务器.ps1`（或手动运行 `python stories-manifest.py`）— 清单会自动刷新。

---

## 封面约定

封面图放在每个故事目录下的 `images/cover.*`。脚本按以下顺序探测（命中即停）：

1. `cover.webp`
2. `cover.jpg`
3. `cover.jpeg`
4. `cover.png`

- **建议尺寸**：竖向长方形（3:4 比例，例如 600×800）
- **未提供封面**：自动显示默认米色渐变书封，不影响使用

---

## 移动端使用

手机和电脑需在 **同一 Wi-Fi** 下，访问 `http://[电脑IP]:8000/index.html`。

- 故事在同一标签页打开，按手机浏览器的"后退"即可返回主页
- 布局自适应，小屏手机两列显示，宽屏多列显示

---

## 部署到 GitHub Pages

由于 GitHub Pages **不提供目录索引**（即访问 `/stories/` 返回 404），本项目通过 `stories-manifest.json` 机制解决：

1. **本地生成清单**：运行 `python stories-manifest.py` 或启动 `启动服务器.ps1` — 会自动生成最新的 `dist/stories-manifest.json`
2. **把整个 `dist/` 目录 push 到 GitHub Pages 仓库**（`dist/` 就是你的发布根目录）
3. 访问 `https://你的用户名.github.io/仓库名/`

> 关键：`app-test.js` 会优先尝试读取 `stories-manifest.json`（相对于 index.html 的路径）；如果不存在，再回退到扫描 `stories/` 目录（本地 Python 服务器模式）。两种模式同一套代码，无需修改。

---

## 注意事项

- **`dist/stories-manifest.json` 是自动生成的**，**不要手动编辑**。每次新增/删除故事目录后，重新运行一次 `stories-manifest.py` 或启动 `启动服务器.ps1` 即可刷新。
- 静态托管（GitHub Pages、Netlify 等）必须依赖 `stories-manifest.json`；本地 Python 服务器两种模式都可用。
- **不需要 Live Server、Node.js 或任何 IDE**，只需 Python 3。
- 故事目录名**可以是中文**，脚本已处理 UTF-8 和 URL 编码。
- 缺失 `index.html` 的目录会自动标记为不可点，不影响其他故事的显示。
