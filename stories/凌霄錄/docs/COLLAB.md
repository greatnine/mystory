# 凌霄錄 · 多 Agent 協作協定

本專案由一位 **Manager**（架構/劇情/整合）＋ 多個 **平行 Agent**（系統/UX/工具）協同。
目標：高吞吐、零（或極低）衝突。

## 角色分工
| 角色 | 負責 | 不碰 |
|---|---|---|
| **Manager** | 劇情/內容（A 系列・`story/`）、引擎資料表(`02-engine`)架構、**整合與驗收** | — |
| **平行 Agent** | 系統/UX/工具（B/C/D 系列），各自獨立檔 | `story/*`、別人的檔 |

> 劇情語氣敏感，集中由 Manager 一人寫；系統/UX 語氣中性，最適合平行。

## 鐵則（避免衝突）
1. **一人一 branch**：`feat/<任務代號>`（如 `feat/achievements`）。
2. **只動自己負責的檔**。需要新 CSS／JS／widget 時，**開新檔**（如 `framework/06b-xxx.twee`），不要改別人或共用的大檔。
3. **`凌霄錄/build/` 不入版控**（已 gitignore）。本機 `./build.sh` 只為預覽，永遠不要 commit build。
4. **PR 前必跑** `node check.mjs`，**綠燈**才開 PR；PR 內容寫清楚動了哪些檔。
5. 由 **Manager 合併** 進 `main`。源碼若真衝突，Manager 裁決。
6. 共用大檔若**非改不可**（如 `02-engine` 的 `setup.events`／`06-styles`），**先跟 Manager 說**，由 Manager 代改或指定 append 區塊。

## 檔案責任歸屬（預設）
| 區域 | 主要負責 |
|---|---|
| `story/**`、`02-engine` 的 events/敵人/角色資料 | **Manager** |
| `framework/0c-settings`、新 `framework/0x-*` 功能檔 | 平行 Agent（各自新檔） |
| `ui/10-title`、`ui/12-codex` 等既有 UI | 認領者；大改前知會 Manager |
| `framework/06-styles` | **盡量別動**；各功能把 CSS 寫進自己的 `[stylesheet]` 新檔 |
| `check.mjs`、`build.sh`、docs | Manager / 工具 Agent |

## 整合流程（Manager）
1. `git fetch`，`git diff --stat main...origin/feat/X` 看範圍。
2. `git merge origin/feat/X`（源碼通常零衝突）。
3. `./build.sh && node check.mjs`（須全綠）＋ preview 抽測。
4. `git push`、PR 自動 MERGED、刪除遠端分支。
5. 重要里程碑：`./build.sh` 後以 `gh release` 發佈可玩 HTML。

## 給平行 Agent 的開場提示（貼上即可）
> 先讀 `CLAUDE.md`、`凌霄錄/docs/PROJECT.md`、`凌霄錄/docs/WORKFLOW.md`、本檔。
> 你的任務：**〔Manager 指派〕**。只動指定檔、開 `feat/<代號>` branch、完成後 `node check.mjs` 綠燈再開 PR，等 Manager 合併。
