# 凌霄錄 · 專案資訊

轉生修仙文字遊戲。引擎 **SugarCube 2.37.3**（與 *Degrees of Lewdity* 同源），以 **Tweego** 由 `.twee` 原始碼編譯成單一 HTML。架構參考 DoL / Course of Temptation 的**時間 × 地點沙盒 + 引導主線**。

> 18+ 成人向設定；所有角色皆成年，親密情節以氛圍與留白呈現，不含露骨描寫。

## 規模一覽（v0.7）
| 指標 | 數量 |
|---|---|
| `.twee` 原始檔 | 46 |
| 段落 passages | 207 |
| 主線卷 | 6（轉生→劍宗→南疆→幽冥→魔道入侵→飛升謎題）＋ 冰心宗並行線 |
| 女主感情線 | 4（蘇羽瑤・青玲兒・裴冬雪・陰離）＋ 立繪 5（含主角凌霄） |
| 區域 / 地點 | 5 / 26 |
| 觸發事件 | 44（主線/約會/支線/秘境隨機） |
| 功法 / 丹方 / 敵人 | 9 / 4 / 10 |
| 系統 | 修煉・突破・心魔試煉・戰鬥(五行)・雙修・煉丹・探索・秘境・御獸・商店・圖鑑・成就・NG+ |

## 四大架構支柱
1. **左側狀態欄 StoryCaption**（`framework/04-caption.twee`）— 每段自動刷新；時辰/地點/三條/資源/深度數值/好感/快捷鍵。
2. **時間系統**（`framework/03-time.twee`）— `$p.time={day,tick}`，tick 0–11＝子…亥；`<<pass N>>` 推進+疲勞、`<<sleep>>`、`<<calmheart>>`。
3. **地點地圖**（`ui/11-map.twee` + `locations/`）— 地點即段落；移動耗時辰；跨域遠行（`journey_south`/`journey_youming`）。
4. **深度數值 + 門檻顏色**（`setup.statDefs` / `setup.gstatHtml`）— 道心・心魔・聲望・疲勞。

## 玩家狀態 `$p`（進存檔）
```
name, realm(0–3), layer, cult            // 境界與修為
hp/maxHp, mp/maxMp, atk, def             // 戰鬥屬性（由 recompute 結算）
stones(靈石), coins(書幣), luck          // 資源
books[], recipes[], pills{}, herbs{}     // 功法/丹方/丹藥/藥材
rel{ suyuyao, qingling, dongxue, yinli } // 好感
stats{ daoxin, xinmo, fame, fatigue }    // 深度數值 0–100
flags{}, buffs{}, ngplus, ngCultMul       // 旗標 / 暫時增益 / 多周目
beasts[], beastEquipped, ach{}, seen{loc,foe} // 御獸 / 成就 / 圖鑑探索
time{ day, tick }, loc, region, placeName, sandbox
// 衍生(recompute 寫入)：cultMul, luckBase, crit, combo
```
**暫態變數**：`$battle`（戰鬥）、`$return`（系統返回目標）、`$alchemyResult`、`$p.cooking`。

## 靜態資料 `setup.*`（`framework/02-engine.twee`，不進存檔）
- 資料表：`realms` `books`(9) `herbs` `recipes`(4) `enemies`(13) `regions`(5) `locations`(26) `events`(44) `statDefs`(4) `portraits`(5) `dailies` `beasts`(6) `shop` `achievements` `enemyElem`/`elemColor`(五行) `dualPartners`
- 函式：`newPlayer` `recompute` `realmName` `cultNeed` `nextRealmLabel` `relText` `has` `rnd` `passTime` `timeName` `isNight` `timeOfDay` `statBand` `gstatHtml` `addStat` `eventsAt` `nextEventAt` `runDaily` `portraitSVG` `toast` `hotkeyLinks` `addHotkeyBadges` `clickByText`

## 原始碼結構（`src/`）
```
framework/   00-storydata 01-config 02-engine 03-time 04-caption
             05-widgets 06-styles 07-special 08-locframe 09-portraits
ui/          10-title 11-map
systems/     20-systems 21-combat(+21c-style 五行/視覺) 22-alchemy 23-dailies
             24-shop 25-beast 26-tribulation 27-dualcult 28-secretrealm
framework/   …0c-settings 0d-achievements 06c-responsive（平行 Agent 交付）
locations/   30-lingxiao 31-nanjiang 32-youming 33-bingling 34-shenxu
story/       30~32 vol1-3 / 40~41,70 女主 / 60-61 vol4 / 80-dates / 90-vol5 / 91-支線 / 92-血蓮 / 100-vol6 / 50,ending*
ui/          10-title 11-map 12-codex 13-ngplus
```
> Tweego 遞迴讀取所有 `.twee`，段落為全域命名空間，**檔名/資料夾僅作整理**，不影響執行。

## 事件流（沙盒如何運作）
1. 玩家在**地點段落**（如 `wuwuchang`）行動，每個行動 `<<pass N>>` 消耗時辰、累積疲勞。
2. 進地點時 `<<eventhere>>` 呼叫 `setup.eventsAt($p, loc)`，把所有 `cond(p)` 成立的事件渲染成發光連結。
3. 事件段落（如 `suyuyao_first`）演完設旗標（使其 cond 之後不再成立），結尾 `<<goto $p.loc>>` 回到當地。
4. 入宗後 `$p.sandbox=true` 開啟地圖；大比解鎖南疆、第三卷通關解鎖幽冥。

## 內容地圖
| 卷 | 區域 | 地點 | 女主 |
|---|---|---|---|
| 一 轉生復仇 | （線性序章） | 廢墟→劍宗山門 | — |
| 二 凌霄劍宗 | 凌霄峰 | 洞府・演武場・藏經閣・丹房・祠堂・劍崖・後山 | 蘇羽瑤 |
| 三 萬妖山盟 | 南疆 | 山寨・靈泉・密林・議事堂・秘境 | 青玲兒 |
| 四 幽冥禁地 | 幽冥澤 | 鬼門關・黃泉路・忘川・亂葬崗・幽冥殿 | 陰離 |
| 並行（大比後北上） | 冰嶺 | 冰心宗山門・寒潭・聖女居・寒玉洞・絕頂 | 裴冬雪 |
| 五 魔道入侵 | 凌霄劍宗（守城） | 群像→守城→血魔尊→元嬰突破→道侶大典 | 群像 |
| 六 飛升謎題 | 中央神墟 | 仙紋→真相→破封印→**飛升抉擇（4 結局）** | 前世道侶揭曉 |

開發/擴充方式見 [`docs/WORKFLOW.md`](WORKFLOW.md) 與根目錄 `CLAUDE.md`；待辦見 [`docs/ROADMAP.md`](ROADMAP.md)；世界觀與情慾設定見 `docs/lingxiao_*_setting.md`。
