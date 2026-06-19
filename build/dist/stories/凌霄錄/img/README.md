# 凌霄錄 · 圖片素材

把圖檔放進這裡，`build.sh` 會自動複製到 `build/img/`（與 HTML 同層），遊戲偵測到即用真圖；
**缺檔或載入失敗會自動回退現有 SVG/印璽卡，不會出現破圖。**

完整 Prompt 與規格見 [`../docs/IMAGE_ASSETS.md`](../docs/IMAGE_ASSETS.md)。

## 已接線・放檔即生效

### 角色立繪（4:5，建議 800×1000 PNG）
`portrait_lingxiao.png`　`portrait_suyuyao.png`　`portrait_qingling.png`　`portrait_dongxue.png`　`portrait_yinli.png`

### 敵人/BOSS（1:1，建議 512×512 PNG）
`foe_bloodlord.png`　`foe_xianmoremnant.png`　`foe_qinxiang.png`　`foe_binglao.png`　`foe_moqian.png`　`foe_yinli.png`
`foe_scout.png`（散修，scout/scout2 共用）　`foe_wildbeast.png`　`foe_ligui.png`　`foe_guidao.png`　`foe_beast.png`　`foe_foxrebel.png`

## prompt 已備・整合待接（生成後告訴我，我接背景層）
- 區域背景（16:9 JPG）：`bg_lingxiao.jpg` `bg_nanjiang.jpg` `bg_youming.jpg` `bg_bingling.jpg` `bg_shenxu.jpg`
- 標題主視覺：`bg_title.jpg`

## 注意
單檔 Release（單一 HTML）不含外部圖；需與 `img/` 一起部署，或日後改 base64 內嵌。
