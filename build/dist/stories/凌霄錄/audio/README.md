# 凌霄錄 · 音訊素材

把音檔放進這個資料夾，`build.sh` 會自動複製到 `build/audio/`（與 HTML 同層），
`setup.audio`（framework/0e-audio.twee）便會自動載入並播放。**無須改任何程式碼。**
缺檔時遊戲靜默降級，不會報錯。

## 檔名對應（放 .mp3 或 .ogg 皆可，改副檔名請同步改 0e-audio.twee 的路徑）

### 背景音樂（BGM，循環）
| 檔名 | 情境 |
|------|------|
| `bgm_title.mp3`    | 標題／關於頁 |
| `bgm_lingxiao.mp3` | 凌霄峰（劍宗） |
| `bgm_nanjiang.mp3` | 南疆萬妖山 |
| `bgm_youming.mp3`  | 幽冥澤 |
| `bgm_bingling.mp3` | 冰嶺 |
| `bgm_shenxu.mp3`   | 中央神墟 |
| `bgm_combat.mp3`   | 一般戰鬥 |
| `bgm_boss.mp3`     | BOSS 戰（血魔尊／仙魔殘念） |

### 音效（SFX，一次性）
| 檔名 | 觸發 |
|------|------|
| `sfx_hit.mp3`   | 戰鬥命中 |
| `sfx_win.mp3`   | 戰鬥勝利（供 `<<sfx "win">>`） |
| `sfx_break.mp3` | 突破成功 |
| `sfx_click.mp3` | 介面點擊（供 `<<sfx "click">>`） |

## 開關
左側「設定」面板有「背景音樂／音效／音量」三項（存於本機 localStorage，與存檔無關）。

## 注意
- 單檔發佈版（Release 的單一 HTML）不含外部音檔；音訊需與 `audio/` 目錄一同部署，或日後改用內嵌 base64。
- 瀏覽器自動播放政策：BGM 通常需玩家首次互動後才會出聲（已 try/catch 靜默處理）。
