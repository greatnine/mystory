# 凌霄錄 · 美術素材生成清單（Prompt 表）

> 給 ChatGPT / DALL·E / 任何生圖工具用。英文 prompt 直接貼最穩；中文為補充說明。
> 生成後把檔案放進 **`凌霄錄/img/`**，檔名對上即可——`build.sh` 會自動複製到 `build/img/`，
> 遊戲偵測到檔就用真圖，**沒檔自動回退現有 SVG/印璽，不會破圖**。

---

## 0. 通用風格（建議每張 prompt 前都加這段，確保整體一致）

```
Chinese xianxia (cultivation fantasy) art, semi-realistic digital painting blended with
traditional ink-wash, elegant and cinematic, muted palette of ink-black, jade, and antique gold,
soft volumetric light, atmospheric, highly detailed, painterly. No text, no watermark,
no signature, no border, no frame.
```

**一致性訣竅**：5 張立繪請在同一個對話、同一段風格描述下連續生成，並統一「半身像、面向鏡頭、置中、深色背景」，才不會風格各異。

---

## 1. 角色立繪（最優先・接口已就緒）

- **比例 4:5（直幅）**，建議 **800×1000 px**，`PNG`（深色或透明背景皆可，遊戲底色為 `#0d0805`）。
- 半身像，臉部置中偏上（會被縮到 56px 用在圖鑑，別擺太邊）。
- 檔名 → 放 `凌霄錄/img/`。

### 1-1 凌霄（主角）— `portrait_lingxiao.png`
```
Half-body portrait of a young male cultivator, around 18, handsome with a cold, composed
expression that hides warmth underneath. Deep violet-black hair (almost ink-purple), warm
fair skin, eyes faintly glowing with chaotic gold light. Wearing dark layered sword-sect robes
with subtle antique-gold trim. A faint swirling aura of "chaos qi" around him. Centered,
facing viewer, dark atmospheric background, 4:5 vertical composition.
```
中文：地球轉生少年、混沌靈根；外冷內熱、護短。墨紫黑髮、暗金鑲邊劍宗道袍、瞳含混沌金光。

### 1-2 蘇羽瑤 — `portrait_suyuyao.png`
```
Half-body portrait of a beautiful aloof young woman, a sword-sect prodigy senior sister.
Long flowing white hair with pale ice-blue highlights, cool fair skin, calm proud eyes.
Wearing pristine white-and-cyan sword cultivator robes, a slender jian sword at her side or
resting against her shoulder. Elegant, distant, ink-wash mountains faintly behind. Centered,
facing viewer, 4:5 vertical.
```
中文：凌霄劍宗第一天才、高冷。白髮帶冰藍、白青劍修道袍、佩長劍。

### 1-3 青玲兒 — `portrait_qingling.png`
```
Half-body portrait of a charming nine-tailed fox-clan princess, playful yet sincere. Golden-blond
hair with amber gradient, warm skin, mischievous bright eyes, delicate fox ears, hints of luxurious
golden fox tails behind her. Wearing southern-wild ornate robes with gold and red accents and tribal
jewelry. Warm, alluring but innocent. Centered, facing viewer, 4:5 vertical.
```
中文：九尾狐族公主、媚而率真。金髮琥珀漸層、狐耳狐尾、南疆華麗服飾。

### 1-4 裴冬雪 — `portrait_dongxue.png`
```
Half-body portrait of an ethereal ice-sect holy maiden with a frozen, emotionless expression.
Pale ice-blue hair, near-translucent porcelain skin, calm distant ice-colored eyes, delicate frost
crystals forming in the air around her. Wearing flowing white-and-ice-blue holy robes. Serene,
cold, lonely beauty. Centered, facing viewer, 4:5 vertical.
```
中文：冰心宗聖女、絕情冰體。冰藍髮、近乎透明肌膚、周身結霜、素白冰藍聖女袍。

### 1-5 陰離 — `portrait_yinli.png`
```
Half-body portrait of an ethereal, ghostly young woman, a former underworld ghost-emissary now
freed and gentle. Silver-white hair, pale luminous skin with a faint translucent quality, soft
lavender-tinted eyes, a slightly otherworldly aura. Wearing pale flowing ghostly robes; a few
small wildflowers tucked in her hair or hand. Delicate, melancholic, tender. Centered, facing
viewer, 4:5 vertical.
```
中文：幽冥前女鬼使、重獲自我的收花少女。銀白髮、半透感、淡紫瞳、素白飄逸、身邊點綴山花。

---

## 2. 敵人 / BOSS（接口已就緒・缺檔回退印璽卡）

- **比例 1:1（正方）**，建議 **512×512 px** 或 **768×768 px**，`PNG`。
- 檔名 `foe_<id>.png` → 放 `凌霄錄/img/`。

### BOSS（強烈建議優先畫）

**血魔尊 — `foe_bloodlord.png`**
```
A terrifying blood demon lord standing atop a sea of crimson blood-clouds, towering and regal,
six thousand years of slaughter aura warping the air, blood-red armor and demonic energy,
glowing red eyes, oppressive and majestic. Dark crimson palette. 1:1 composition, dramatic.
```

**仙魔殘念 — `foe_xianmoremnant.png`**
```
A formless remnant entity born from an ancient war between immortals and demons — one half
radiant celestial light, the other half pitch-black demonic darkness, fused and clashing.
Broken celestial runes and shattered seal fragments swirl around it. Neither human nor beast,
eerie and powerful. 1:1 composition.
```

**秦驤（天驕弟子）— `foe_qinxiang.png`**
```
An arrogant handsome young male cultivator, a sect prodigy, wearing luxurious brocade robes,
sneering with contempt, a fine sword pointed forward, golden metal-element aura. 1:1.
```

**冰心宗執法長老 — `foe_binglao.png`**
```
A stern ice-sect enforcement elder in winter-blue daoist robes, frost crystallizing around his
body, cold authoritative gaze, glacial aura. 1:1.
```

**血煞魔宗先鋒 — `foe_moqian.png`**
```
A savage blood-demon-sect vanguard cultivator, blood-soaked robes, murderous grin, standing on
a hill of corpses, crimson killing aura. 1:1.
```

**陰離（敵態 / 任務人格）— `foe_yinli.png`**
```
A possessed female ghost-emissary, white hair, hollow expressionless eyes, pale translucent skin,
holding a blade, controlled and puppet-like, cold ghostly aura. Tragic and eerie. 1:1.
```

### 雜兵（次要・可共用，缺檔仍會用印璽卡）

| 檔名 | id | 一句話 prompt 核心 |
|---|---|---|
| `foe_scout.png` | scout / scout2 | sinister rogue cultivator of a dark royal manor, drawing a blade |
| `foe_wildbeast.png` | wildbeast | a miasma-shrouded demon wolf lunging from a poisonous jungle |
| `foe_ligui.png` | ligui | a vengeful ghost rising from a mass grave, wailing, eerie green light |
| `foe_guidao.png` | guidao | a ghost-path cultivator wielding dark soul-stealing wind, sinister |
| `foe_beast.png` | beast | a wounded colossal ancient demon beast, blood-soaked, glowing golden eyes, more ferocious for being hurt |
| `foe_foxrebel.png` | foxrebel | a rebel fox-clan cultivator leaping with demonic wind, agile and hostile |

（雜兵 prompt 一樣記得前面加「通用風格」那段。）

---

## 3. 場景 / 區域背景（可選・氛圍升級・整合需我再接一次線）

- **比例 16:9（橫幅）**，建議 **1600×900 px**，`JPG`（檔案小）。
- **不要畫人物**，偏暗（文字會壓在上面）。
- 檔名 `bg_<region>.jpg`。生成後跟我說一聲，我幫你接到地點背景層。

| 檔名 | 區域 | prompt 核心 |
|---|---|---|
| `bg_lingxiao.jpg` | 凌霄峰 | a towering sword-sect peak above a sea of clouds at dawn, ink-wash mountains, ethereal, no people |
| `bg_nanjiang.jpg` | 南疆萬妖山 | a humid southern demon-mountain jungle, thick miasma mist, exotic flora, eerie green light, no people |
| `bg_youming.jpg` | 幽冥澤 | a ghostly underworld swamp shrouded in death-energy fog, drifting will-o-wisps, cold and desolate, no people |
| `bg_bingling.jpg` | 冰嶺 | a lonely snow-capped ice ridge, endless white blizzard, frozen cliffs, cold blue tones, no people |
| `bg_shenxu.jpg` | 中央神墟 | ancient ruined battlefield of an immortal-demon war, broken celestial runes and shattered weapons, distorted warped space, no people |

---

## 4. 標題主視覺 / Logo（可選・整合需我再接）

**主視覺 — `bg_title.jpg`（16:9, 1600×900）**
```
Epic xianxia key art: a lone young cultivator seen from behind, standing before a radiant immortal
gate amid a vast sea of clouds, beams of golden immortal light pouring through, distant celestial
palaces, awe and mystery. Leave the upper-center relatively clear for a title. Cinematic,
ink-wash blended with painterly digital art. No text.
```
中文：少年背影、立於雲海仙門前、金色仙光傾瀉；上方留白給標題。

---

## 5. （選配）小圖示

法寶、靈獸、符籙目前純文字，想精緻可各配 **128×128 PNG** 圖示（透明背景、扁平描金線稿風）。需要的話我再給你逐一的 id ↔ prompt 對照表。

---

## 6. 整合狀態速查

| 類別 | 狀態 | 放檔位置 |
|---|---|---|
| 角色立繪 | ✅ 已接線，放檔即生效 | `凌霄錄/img/portrait_<id>.png` |
| 敵人/BOSS | ✅ 已接線，放檔即生效 | `凌霄錄/img/foe_<id>.png` |
| 區域背景 | ◐ prompt 已備，整合待接 | `凌霄錄/img/bg_<region>.jpg` |
| 標題主視覺 | ◐ prompt 已備，整合待接 | `凌霄錄/img/bg_title.jpg` |
| 小圖示 | ○ 選配 | 待定 |

> 角色 id：`lingxiao` `suyuyao` `qingling` `dongxue` `yinli`
> 敵人 id：`bloodlord` `xianmoremnant` `qinxiang` `binglao` `moqian` `yinli` `scout` `wildbeast` `ligui` `guidao` `beast` `foxrebel`
>
> 單檔 Release（單一 HTML）不會內嵌外部圖；要連同 `img/` 一起部署，或日後改 base64 內嵌。
