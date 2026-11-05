# TITLE: 时光的故事
# AUTHOR: 大智若愚

# THEME: dark
//# AUTOCLEAR: on


# TONE: flirty 🔥
# TONE: shy 💜
# TONE: bold ⚡

# TONE: danger warning


//# BACKGROUND: assets/background.jpg

//# BACKGROUND: none

/*
# USER_INPUT: input
请输入你的名字！
VAR input=""
你的输入: {input}.
//# ACHIEVEMENT: 任务完成！
*/

:: 时光的故事

那件事情还没忘吗？
#CLASS: dramatic 
那件事情还没忘吗？
# IMAGE: assets/background.jpg center 50vw "Flowers!"
我们的故事就这样开始了！

# ACHIEVEMENT: 神圣的使命等待你去完成!





-> murder_scene

// 辅助函数：从列表中弹出元素
=== function pop(ref list)
~ temp x = LIST_MIN(list) 
~ list -= x 
~ return x

//
//  系统：物品可具有不同状态
//  有些是通用状态，有些是特定物品的专有状态
//

LIST OffOn = off, on
LIST SeenUnseen = unseen, seen

LIST GlassState = (none), steamed, steam_gone
LIST BedState = (made_up), covers_shifted, covers_off, bloodstain_visible

//
// 系统：库存
//

LIST Inventory = (none), cane, knife

=== function get(x)
	~ Inventory += x

//
// 系统：物品位置管理
// 物品可被放入或放置在不同位置
//

LIST Supporters = on_desk, on_floor, on_bed, under_bed, held, with_joe

=== function move_to_supporter(ref item_state, new_supporter) ===
	~ item_state -= LIST_ALL(Supporters)
	~ item_state += new_supporter


// 系统：递增式知识管理
// 每个列表都是一条事实链，每个事实会取代之前的事实
//

VAR knowledgeState = ()

=== function reached (x) 
~ return knowledgeState ? x 

=== function between(x, y) 
~ return knowledgeState? x && not (knowledgeState ^ y)

=== function reach(statesToSet) 
~ temp x = pop(statesToSet)
{
- not x: 
	~ return false 

- not reached(x):
	~ temp chain = LIST_ALL(x)
	~ temp statesGained = LIST_RANGE(chain, LIST_MIN(chain), x)
	~ knowledgeState += statesGained
	~ reach (statesToSet) 	// 设置列表中剩余状态
	~ return true  	        // 成功设置该状态，返回 true

	- else:
	~ return false || reach(statesToSet) 
	}	

//
// 游戏初始化
//

VAR bedroomLightState = (off, on_desk)

VAR knifeState = (under_bed)


//
// 知识链
//

LIST BedKnowledge = neatly_made, crumpled_duvet, hastily_remade, body_on_bed, murdered_in_bed, murdered_while_asleep

LIST KnifeKnowledge = prints_on_knife, joe_seen_prints_on_knife, joe_wants_better_prints, joe_got_better_prints

LIST WindowKnowledge = steam_on_glass, fingerprints_on_glass, fingerprints_on_glass_match_knife

//
// 内容
//





=== murder_scene ===

    #IMAGE: assets/background.jpg
    
	卧室。案发地。现在该寻找线索了。
	
	[---] 
	# ACHIEVEMENT: 任务尚待完成！

	
- (top)
	{ bedroomLightState ? seen:     <- seen_light  }
	<- compare_prints(-> top)

*   (dobed) [床……]
	床离地不高，但也不至于什么都滚不进去。它依旧被整齐地铺好。		#AUDIO: assets/notification-bell.mp3
	~ reach (neatly_made)
	- - (bedhub)
	* *     [掀开被子# flirty]
			我掀开了被子。被褥已经被压皱。# AUDIO: assets/notification-bell.mp3
			# NOTIFICATION: 你发现了秘密通道.
			
			~ reach (crumpled_duvet)
			~ BedState = covers_shifted
			
			
			
	* *     (uncover) {reached(crumpled_duvet)}
			[拿掉被子shy 💜]
			
			小心翼翼地，我完全移开了被子，下方的被褥一片凌乱。
			这并非一位尽职的女仆所为，显然是匆忙间丢上的。
			~ reach (hastily_remade)
			~ BedState = covers_off
			
	* *     (duvet) {BedState == covers_off} [拉开被褥]
			我拉开了被褥，下面的床单上粘着血迹。
			~ BedState = bloodstain_visible
			~ reach (body_on_bed)
			不是尸体先被移到这里，就是这里正是案发地。
			
	* *     {BedState !? made_up} [重新整理床铺]
			我小心翼翼地把床单铺回原状，试图让它看起来毫无动过的痕迹。
			~ BedState = made_up
			
	* *     [测试床铺# bold # danger]
			我张开手指按了按床，床吱呀作响，但声响并不大。			# WARNING: 防人之心不可无。
            //	->play_sound-> 
            
	* *     (darkunder) [查看床下]
			我躺下来，往床下看去，但什么都看不清。

	* *     {TURNS_SINCE(-> dobed) > 1} [看看别处？]
			我从床边退后一步，环顾四周。
			-> top
	- -     -> bedhub
	


*   {darkunder && bedroomLightState ? on_floor && bedroomLightState ? on}
	[查看床下]
	我往床下看去，有什么东西在闪光。

	- - (reaching)
	* *     [伸手去拿]
			我伸手到床下去够，但无论那是什么，已经被踢得太远够不到。
			-> reaching
	* *     {Inventory ? cane} [用手杖够]
			-> knock_with_cane

	* *     {reaching > 1 } [站起来]
			我再次站起身，拍了拍大衣。
			-> top

*   (knock_with_cane) {reaching && TURNS_SINCE(-> reaching) >= 4 &&  Inventory ? cane } [用手杖够床下的东西]
	我用手杖对准地毯轻轻一挑，闪光的东西从床脚滑了出来。
	~ move_to_supporter( knifeState, on_floor )
	* *     (standup) [站起来]
			我满意地站起身，看到被挑出来的是一把带血的刀。
			-> top

	* *     [再次查看床下]
			我移开手杖，再次查看床下，但那里已经没有其他东西。
			-> standup

*   {knifeState ? on_floor} [捡起刀]
	我小心翼翼地避开刀柄，将刀从地毯上拾起。
	~ get(knife)

*   {Inventory ? knife} [查看刀]
	刀上的血迹已经干了，足够显露出刀柄上的部分指纹！
	~ reach (prints_on_knife)

*   [书桌……]
	我把注意力转向书桌。一盏台灯放在一角，另一角是空空的收纳盘，桌面没有其他东西。
	一根木手杖斜靠在桌边。
	~ bedroomLightState += seen

	- - (deskstate)
	* *     (pickup_cane) {Inventory !? cane}  [捡起手杖]
			~ get(cane)
		我捡起了这根木手杖，它很沉，却没有任何标记。

	* *    { bedroomLightState !? on } [打开台灯]
			-> operate_lamp ->

	* *     [查看收纳盘]
			我看了看收纳盘，但里面什么都没有。要么是死者的文件被拿走了，要么他根本没什么业务，又或只是摆设。

	+ +     (open)  {open < 3} [打开抽屉]
			我{随便抽开一个|又拉开另一个|拉开第三个}抽屉，{锁着|也是锁着|果然也是锁着}。

	* *     {deskstate >= 2} [看看别处？]
			我再次从桌边退后一步。
			-> top

	- -     -> deskstate

*     {(Inventory ? cane) && TURNS_SINCE(-> deskstate) <= 2} [挥动手杖]
	我仍握着手杖，轻轻挥了挥。它确实很沉，但不足以当作钝器使用。
	不过若是自卫时用上倒也合适。可死者当时为什么没有抓起它？或者碰倒它？
	
*   [窗户……]
	我走到窗户旁，往外看去，只能见到房子旁潺潺流过的小溪。

	- - (window_opts)
	<- compare_prints(-> window_opts)
	* *     (downy) [往下看小溪]
			{ GlassState ? steamed:
				透过被雾气笼罩的玻璃，我看不清小溪。 -> see_prints_on_glass -> window_opts
			}
			我看着那条小溪匆匆流过。这栋房子大概有点潮湿，但除此之外，这景象并没有告诉我什么。
	* *     (greasy) [查看玻璃]
			{ GlassState ? steamed: -> downy }
			窗户上的玻璃很脏。里面外面都没人清理过。
	* *     { GlassState ? steamed && not see_prints_on_glass && downy && greasy }
			[查看雾气]
			外面很冷，自然我的呼吸会在玻璃上起雾。 -> see_prints_on_glass ->
	+ +     {GlassState ? steam_gone} [对着玻璃哈气]
			我轻轻对着玻璃哈了口气。{ reached (fingerprints_on_glass): 指纹又重新显现出来。 }
			~ GlassState = steamed

	+ +     [看看别处？]
			{ window_opts < 2 || reached (fingerprints_on_glass) || GlassState ? steamed:
				我从昏暗的玻璃上移开了视线。
				{GlassState ? steamed:
					~ GlassState = steam_gone
					<> 我呼出的雾气渐渐散去。
				}
				-> top
			}
			我从玻璃上靠了回去，我的呼吸在玻璃上凝起了一层雾。
		~ GlassState = steamed

	- -     -> window_opts

*   {top >= 5} [离开房间]
	我看得够多了。我{bedroomLightState ? on:关掉了台灯，然后}转身离开了房间。
	-> joe_in_hall

-   -> top





	= play_sound
    (此处音乐响起 ......`\# AUDIO: assets/guqin.mp3`) # AUDIO: assets/guqin.mp3
    ->->
    
    






= operate_lamp
	我按下了灯的开关。
	{ bedroomLightState ? on:
		<> 灯泡熄灭了。
		~ bedroomLightState += off
		~ bedroomLightState -= on
	- else:
		{ bedroomLightState ? on_floor: <> 灯光透过床下洒出一丝微光。} { bedroomLightState ? on_desk : <> 灯光在抛光的桌面上闪烁着光芒。 }
		~ bedroomLightState -= off
		~ bedroomLightState += on
	}
	->->


= compare_prints (-> backto)
	*   { between ((fingerprints_on_glass, prints_on_knife), fingerprints_on_glass_match_knife) } 
[对比刀上的指纹和窗户上的指纹]
		我拿着带血的刀靠近窗户，对着玻璃哈了口气让指纹再次显现，尽力进行对比。
		虽说这并不科学，但它们看起来非常相似——非常相似。
		~ reach (fingerprints_on_glass_match_knife)
		-> backto

= see_prints_on_glass
	~ reach (fingerprints_on_glass)
	{但我能看见一些指纹，就像有人用手掌按过似的。|指纹非常清晰完整。} 当我注视时，它们渐渐消散。
	~ GlassState = steam_gone
	->->

= seen_light
	*   {bedroomLightState !? on} [打开台灯]
		-> operate_lamp ->

	*   { bedroomLightState !? on_bed  && BedState ? bloodstain_visible }
		[把灯移到床上]
		~ move_to_supporter(bedroomLightState, on_bed)

		我把灯移到血迹处仔细观察。血已经渗透进棉质床单的纤维中。
		毫无疑问，凶手是在这里行凶的。
		~ reach (murdered_in_bed)

	*   { bedroomLightState !? on_desk } {TURNS_SINCE(-> floorit) >= 2 }
		[把灯移回桌子]
		~ move_to_supporter(bedroomLightState, on_desk)
		我把灯移回桌子，放回它原来的位置。
	*   (floorit) { bedroomLightState !? on_floor && darkunder }
		[把灯移到地上]
		~ move_to_supporter(bedroomLightState, on_floor)
		我把灯拾起，放到了地上。
	-   -> top

=== joe_in_hall
	我的警察联系人乔正站在走廊里等我。“怎么样？”他问道，“你发现了什么有趣的东西吗？”
- (found)
	*   {found == 1} “没有。”
		他耸了耸肩：“可惜。”
		-> done
	*   { Inventory ? knife } “我找到了凶器。”
		“干得好！”乔笑着回答，“我们以为凶手已经处理掉了它。我现在帮你封存起来。”
		~ move_to_supporter(knifeState, with_joe)

	*   {reached(prints_on_knife)} { knifeState ? with_joe }
		“刀上有指纹。”我告诉他。
		他仔细查看。
		“唔，不太完整，要比对起来有点困难。”
		~ reach (joe_seen_prints_on_knife)
	*   { reached((fingerprints_on_glass_match_knife, joe_seen_prints_on_knife)) }
		“刀上的指纹和窗户上的指纹是同一人留下的。”
		“谁都可能碰过窗户。”乔若有所思地回答，“但如果窗户上的指纹更完整，或许能帮我们找到匹配！”
		~ reach (joe_wants_better_prints)
	*   { between(body_on_bed, murdered_in_bed)}
		“尸体曾被移到床上，然后又被移回地面。”我告诉他。
		“为什么？”
		* *     “我不知道。”
				乔点点头：“好吧。”
		* *     “可能是为了从地上拿东西？”
				“没必要为了拿东西而搬动整具尸体。”
		* *     “可能是死在床上的。”
				“现在说什么都是猜测。”乔说。
	*   { reached(murdered_in_bed) }
		“受害者是在床上被谋杀的，随后尸体被移到了地上。”
		“为什么？”
		* *     “我不知道。”
				乔点点头：“好吧。”
		* *     “可能凶手想误导我们。”
				“怎么误导？”
			* * *   “想让我们以为受害者是清醒着遇害的。”我若有所思地回答，“好像他是见到了凶手才被杀。”
			* * *   “想让我们以为曾经发生过搏斗。”我回答，“让我们以为他不是在睡梦中被杀的。”
			- - -   “但如果真是在床上被杀，那很可能他是在睡觉时被刺杀的。”
					~ reach (murdered_while_asleep)
		* *     “可能凶手想清理现场。”
				“然后被打断了？也有可能。”

	*   { found > 1} “就这些。”
		“好吧，总算是个开始。”乔回答。
		-> done
	-   -> found
-   (done)
	{
	- between(joe_wants_better_prints, joe_got_better_prints):
		~ reach (joe_got_better_prints)
		<> “我现在去把窗户上的指纹提取下来。”
	- reached(joe_seen_prints_on_knife):
		<> “我会尽量比对这些指纹。”
	- else:
		<> “线索不多。”
	}
	-> END
	
	
	
	
	
=== character_sheet ===
# SPECIAL_PAGE: 人物信息

:: 你的人物

__Name:__ 爱丽丝
__Level:__ 5
__Health:__ 100/100

-> DONE

=== inventory ===
# SPECIAL_PAGE: 物件与用品

:: 物品

> 5 苹果
> 1 锯子



-> DONE

=== credits ===
# SPECIAL_PAGE: 关于

:: 关于

作者: 大智若愚  # ERROR: 出错了。

->DONE



=== content_warnings ===
# SPECIAL_PAGE: 内容警示
:: 内容警告

本演示文稿包含：
> 强烈的按钮点击操作
> 文本格式的图形化描述
> 强迫性地创建保存文件
> 强烈的语言（如“Ink”和“JavaScript”）
> 成熟的主题，包括适当的错误处理
> 可能引发突然想要创作互动小说的冲动
-> DONE