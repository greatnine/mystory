#TITLE: 雨夜客栈
#AUTHOR: 传习者戚

#PAGE_MENU: character_sheet, inventory,, credits

# TONE_INDICATORS: on
# TONE: flirty 🔥
# TONE: shy 💜
# TONE: bold ⚡
# TONE: danger warning

EXTERNAL DEBUG_LOG(message)
EXTERNAL DEBUG_WARN(message)
EXTERNAL NOW()
EXTERNAL FORMAT_DATE(timestamp, locale)


~ DEBUG_LOG("Player entered 雨夜客栈")
~ DEBUG_WARN("这个路径还没有完全写完")


VAR LOCALE = "ja-JP"
Today is {FORMAT_DATE(NOW(), LOCALE)}.

INCLUDE 雨夜客栈.ink
INCLUDE page_menu.ink

