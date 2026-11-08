// ================= 《雨夜客栈》 storylet 示例 =================
// 每夜从牌堆随机抽 2 张故事牌，tunnel 播放后返回主循环
// 用过的牌退出牌堆；信任度影响牌内分支文本





VAR debug = true
//VAR debug = false


VAR 已用牌 = ()
VAR 信任 = 0
VAR 夜 = 0

VAR health = 80
VAR mana = 25
VAR strength = 60
VAR reputation = 45

:: 雨夜客栈

> 客栈的老板行为诡异
> 隔壁的老猫叫声奇特
> 窗外不时有说话声

>> 生活的经验证明：令人难忘的故事往往都发生在雨夜。尤其是在初夏的时节。

//[Visit Google](google.com)           // External link

[---]  // Creates a horizontal line

[孩子，出门在外要格外小心](your-custom-class)

VAR player_name = ""

//# USER_INPUT: player_name "你的名字?"

//Hello, {player_name}! Welcome to the adventure. 

#IMAGE: assets/background.jpg left 40%  "88888888888"

自从来了新村长刘大刚,小山村就从来没有安静过。大大小小批斗会一个接着一个。今天斗黑五类，明天揪走资派，后天批臭老九。还花样繁多：老虎凳；坐飞机；游街示众。





//* [这是一个什么样的故事?  # flirty ]
//* [这是什么话?  我阅读    # bold ]
//* ->
//- 


->开始

// ========= 主循环 =========
=== 开始
# AUDIO: assets/notification-bell.mp3
- (loop)
    ~ 夜 = 夜 + 1
    第{夜}夜，{&雨敲着窗|阴雨敲着纱窗|风雨吹散着玻璃窗}。 {夜 > 1: 又是一个不能出门的夜晚。}
    
    // 牌堆还有牌才抽
    


    {debug: 你手里还有牌。{LIST_COUNT(cards)}}
    
    { LIST_COUNT(cards) > 0:
        ~ temp a = pop_random(cards)
        ~ temp b = pop_random(cards) 
        -> play_card(a)->
        -> play_card(b) ->
        
        ~ 已用牌 -= a + b
    }
    
    { LIST_COUNT(cards) == 0: 
        {debug: 你手里还有牌。{LIST_COUNT(cards)}}
        ~ trust_check()
        -> ENDING
    }

    + [上楼睡觉]
       ~ trust_check()
    -> loop



// ========= 10 张故事牌（tunnel 写法，->-> 返回）=========
EXTERNAL OPEN_PAGE(knotName)
=== 初遇1
    你走进大堂。掌柜擦着一只永远擦不干的杯子。
    "客官，这样的雨夜，还赶路？"
    * "不赶了。"  # flirty 
        ~ 信任 += 1
        掌柜笑了笑，给你多添了一碟豆子。
        # WARNING: 小心陌生人的笑......
    * [什么也不说 # bold]  
    掌柜也不再问。
        ** [查看物品]
        ~OPEN_PAGE("inventory")
    - ->->

=== mao_jiao
    # AUDIO: assets/notification-bell.mp3
    半夜，一只黑猫蹲在房梁上叫。# danger
    {信任 >= 1: 掌柜悄悄上楼："别怕，它认生。" | 你独自听着，直到雨声盖过猫叫。}
    ->->

=== lü_ren_旅人
    # NOTIFICATION: 你要留心是否有什么危机发生......
    门被推开，一个湿透的旅人跌进来，怀里死死抱着一个木匣。
    他不肯交出木匣，也不肯解释。
    ->->

=== jiu_xin
    炉边有一封烧了一半的旧信，落款被火舌吃掉了。
    你只读到一个名字——像掌柜的名字。
    ->->

=== du_tu
    三下急促的敲门声。门外的人自称是"路过"的赌徒，想借一副牌。
    {cards ? 雪: 他搓着手说："听说山里今晚要下雪，走不了了。" | 他等不及回答，又冲回了雨里。}
    ->->

=== jiao_lou
    阁楼上传来脚步声。一下，两下，然后是长久的寂静。
    掌柜说阁楼堆的是旧年货。你没再问。
    ->->

=== xue
    雨停了，落起了雪。
    旅人在窗前站了很久。木匣抱得更紧了。
    ->->

=== jiu
    掌柜端来自酿的酒，说你看起来累了。
    {信任 >= 2: 他多说了几句：阁楼上住着他"不敢见"的人。 | 他什么也没多说。}
    ->->

=== mao_yan
    # AUDIO: assets/notification-bell.mp3
    黑猫的眼睛在黑暗里亮起来，直勾勾盯着楼梯口。
    你顺着看去，什么也没有。
    # ERROR: 好像有些不对......
    ->->

=== dao_bie
    # AUDIO: assets/notification-bell.mp3
    天亮了。旅人把木匣留在柜台上，走进雪里。
    掌柜打开匣子——里面是那半封旧信的另一半。
    ~ 信任 += 3
    ->->
    
    

  
  
  
  
  
  
EXTERNAL GET_POEM(theme) 
===ENDING
# AUDIO: assets/notification-bell.mp3
//# AUDIO: assets/guqin.mp3  //一次播放
//# MUSIC: assets/guqin.mp3    //循环播放
【完】
[---]
{GET_POEM("雨夜")}
{GET_POEM("酒")}
# ACHIEVEMENT: 期待有什么收获......  
->END
    

=== function trust_check
    {信任 >= 3: 这一晚，你终于知道阁楼上住的是谁。 | 有些事，雨停之前你不会知道。}
    ~ return true
    
// ========= 工具函数 =========
=== function pop_random(ref _list)
    ~ temp el = LIST_RANDOM(_list)
    ~ _list -= el
    ~ return el


LIST cards = (初遇掌柜), (夜半猫叫), (湿透的旅人), (旧信), (赌徒敲门), (阁楼脚步), (雪), (掌柜的酒), (猫的眼睛), (天亮道别)
// ========= 分发函数：把列表元素映射到对应 tunnel =========
=== play_card(card)===
{
    - card == 初遇掌柜:     -> 初遇1
    - card == 夜半猫叫:     -> mao_jiao 
    - card == 湿透的旅人:   ->  lü_ren_旅人 
    - card == 旧信:         ->  jiu_xin 
    - card == 赌徒敲门:     ->  du_tu 
    - card == 阁楼脚步:     ->   jiao_lou 
    - card == 雪:           ->   xue 
    - card == 掌柜的酒:     ->   jiu 
    - card == 猫的眼睛:     ->  mao_yan
    - card == 天亮道别:     ->    dao_bie 
}
->->
