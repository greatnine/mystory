# Web App 书斋

测试 web app 在浏览器中的表现。一个面向写作爱好者创作 IF（互动小说）的轻量测试入口。

---

## 功能

- **自动扫描** `stories/` 目录下的子目录，无需修改代码
- **书架式布局**：每个故事显示为一本小书（书名 + 装饰性书脊）
- **自动检测封面**：若子目录内存在 `images/cover.webp/jpg/jpeg/png`，则作为该书封面显示
- **自动检测入口**：检测每个子目录下是否存在 `index.html`，缺失时标记为"不可点"
- **一键访问故事**：点击书名即打开故事的 `index.html`，浏览器"后退"即可返回主页
- **双端适配**：PC 宽屏多列、手机两列，均可正常显示
- **异步渲染**：无需等待全部目录检测完成即显示卡片

---

## 文件结构

```
网页测试/
├── index.html             # 主入口页面
├── style.css              # 书架/书封样式（文学书籍美学风）
├── app-test.js            # 目录扫描与动态渲染逻辑
├── 启动服务器.bat         # Windows 一键启动（双击即用）
├── 启动服务器.ps1         # PowerShell 版一键启动
├── requirements.md        # 需求文档
├── prompt.txt             # 提示词
├── stories/               # 故事目录（每个子目录 = 一个故事）
│   ├── story1/
│   │   ├── index.html     # 故事入口（必需）
│   │   └── images/
│   │       └── cover.jpg  # 书封（可选，支持 webp/jpg/jpeg/png）
│   ├── twineIF/
│   │   ├── index.html
│   │   └── images/
│   │       └── cover.webp
│   ├── 凌霄錄/
│   │   └── index.html
│   ├── 守护者v2/
│   │   └── index.html
│   ├── story2/            # （示例：缺少 index.html，主页会标记为不可点）
│   └── test3/             # （示例：缺少 index.html，主页会标记为不可点）
└── README.md              # 本文件
```

---

## 使用方式

### 方法一：一键启动（推荐，Windows）

1. 将故事以独立文件夹形式放在 `stories/` 目录下。
2. 每个故事文件夹内需包含一个 `index.html` 作为入口。
3. **双击 `启动服务器.bat`** —— 自动启动本地服务器并在浏览器打开主页。
4. 浏览完毕后，在黑色窗口按 `Ctrl+C` 停止。

> 也可用 **PowerShell 版**：右键 `启动服务器.ps1` → "使用 PowerShell 运行"

### 方法二：手动启动 Python 服务器

在项目目录下打开 PowerShell/CMD：

```bash
python -m http.server 8000
```

然后浏览器访问 `http://localhost:8000/index.html`。

---

## 新增故事（零配置）

只需在 `stories/` 下新建一个目录，包含 `index.html` 即可：

```
stories/
└── 我的新故事/
    ├── index.html        ← 必需（故事入口）
    └── images/
        └── cover.jpg     ← 可选（书封图片，不提供则显示默认书封）
```

刷新主页 `index.html`，新书会自动出现在书架上。

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

## 注意事项

- **必须通过本地服务器访问**。由于浏览器安全策略，直接以 `file://` 协议打开 `index.html` 会导致目录扫描失败（显示"Failed to fetch"或"扫描目录时遇到问题"）。
- **不需要 Live Server、Node.js 或任何 IDE**，只需 Python 3。
- 故事目录名**可以是中文**，脚本已处理 URL 编码。
- 缺失 `index.html` 的目录会自动标记为不可点，不影响其他故事的显示。
