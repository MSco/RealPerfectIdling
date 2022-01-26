RPI = {}

function_list = [
'Game.Loop',
'Game.UpdateSpecial', 
'Game.UpdateMenu',
'Game.UpdatePrompt', 
'Game.UpdateAscendIntro',
'Game.UpdateReincarnateIntro',
'Game.UpdateAscend',
'Game.particlesUpdate', 
'Game.ToggleSpecialMenu', 
'Game.RefreshStore',
'Game.RebuildUpgrades', 
'Game.UpdateTicker',
'Game.NotesLogic',
'Game.tooltip.update',
'Game.particleAdd',
'Game.Unlock']

RPI.original_functions = new Array(function_list.length)

RPI.doLumps = Game.doLumps
eval('RPI.doLumps='+Game.doLumps.toString().replace(/l\(\'.*;/g, ""));

for (var i=0; i<function_list.length; i++)
{
	RPI.original_functions[i] = eval(function_list[i])
	eval(eval('function_list[i]')+ '=function(a=0,b=0){}')
}



RPI.Logic=function()
{
	if (!Game.OnAscend && Game.AscendTimer==0)
	{
		for (var i in Game.Objects)
		{
			if (Game.Objects[i].eachFrame) Game.Objects[i].eachFrame();
		}
		Game.UpdateSpecial();
//		RPI.UpdateGrandmapocalypse();
//		
		//these are kinda fun
		if (Game.BigCookieState==2 && !Game.promptOn && Game.Scroll!=0) Game.ClickCookie();
		if (Game.BigCookieState==1 && !Game.promptOn) Game.ClickCookie();
		
		//handle milk and milk accessories
		Game.milkProgress=Game.AchievementsOwned/25;
		if (Game.milkProgress>=0.5) Game.Unlock('Kitten helpers');
		if (Game.milkProgress>=1) Game.Unlock('Kitten workers');
		if (Game.milkProgress>=2) Game.Unlock('Kitten engineers');
		if (Game.milkProgress>=3) Game.Unlock('Kitten overseers');
		if (Game.milkProgress>=4) Game.Unlock('Kitten managers');
		if (Game.milkProgress>=5) Game.Unlock('Kitten accountants');
		if (Game.milkProgress>=6) Game.Unlock('Kitten specialists');
		if (Game.milkProgress>=7) Game.Unlock('Kitten experts');
		if (Game.milkProgress>=8) Game.Unlock('Kitten consultants');
		if (Game.milkProgress>=9) Game.Unlock('Kitten assistants to the regional manager');
		if (Game.milkProgress>=10) Game.Unlock('Kitten marketeers');
		if (Game.milkProgress>=11) Game.Unlock('Kitten analysts');
		if (Game.milkProgress>=12) Game.Unlock('Kitten executives');
		Game.milkH=Math.min(1,Game.milkProgress)*0.35;
		Game.milkHd+=(Game.milkH-Game.milkHd)*0.02;
		
		Game.Milk=Game.Milks[Math.min(Math.floor(Game.milkProgress),Game.Milks.length-1)];
		
		if (Game.autoclickerDetected>0) Game.autoclickerDetected--;
		
		//handle research
		if (Game.researchT>0)
		{
			Game.researchT--;
		}
		if (Game.researchT==0 && Game.nextResearch)
		{
			if (!Game.Has(Game.UpgradesById[Game.nextResearch].name))
			{
				Game.Unlock(Game.UpgradesById[Game.nextResearch].name);
				if (Game.prefs.popups) Game.Popup('Researched : '+Game.UpgradesById[Game.nextResearch].name);
				else Game.Notify('Research complete','You have discovered : <b>'+Game.UpgradesById[Game.nextResearch].name+'</b>.',Game.UpgradesById[Game.nextResearch].icon);
			}
			Game.nextResearch=0;
			Game.researchT=-1;
			Game.recalculateGains=1;
		}
		//handle seasons
		if (Game.seasonT>0)
		{
			Game.seasonT--;
		}
		if (Game.seasonT<=0 && Game.season!='' && Game.season!=Game.baseSeason && !Game.Has('Eternal seasons'))
		{
			var str=Game.seasons[Game.season].over;
			if (Game.prefs.popups) Game.Popup(str);
			else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon);
			if (Game.Has('Season switcher')) {Game.Unlock(Game.seasons[Game.season].trigger);Game.seasons[Game.season].triggerUpgrade.bought=0;}
			Game.season=Game.baseSeason;
			Game.seasonT=-1;
		}
		
		//handle cookies
		if (Game.recalculateGains) Game.CalculateGains();
		Game.Earn(Game.cookiesPs/Game.fps);//add cookies per second
		
		//grow lumps
		RPI.doLumps();
		
		//minigames
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			if (Game.isMinigameReady(me) && me.minigame.logic && Game.ascensionMode!=1) me.minigame.logic();
		}
//		
		if (Game.specialTab!='' && Game.T%(Game.fps*3)==0) Game.ToggleSpecialMenu(1);
		
		//wrinklers
		if (Game.cpsSucked>0)
		{
			Game.Dissolve((Game.cookiesPs/Game.fps)*Game.cpsSucked);
			Game.cookiesSucked+=((Game.cookiesPs/Game.fps)*Game.cpsSucked);
			//should be using one of the following, but I'm not sure what I'm using this stat for anymore
			//Game.cookiesSucked=Game.wrinklers.reduce(function(s,w){return s+w.sucked;},0);
			//for (var i in Game.wrinklers) {Game.cookiesSucked+=Game.wrinklers[i].sucked;}
		}
		
		//var cps=Game.cookiesPs+Game.cookies*0.01;//exponential cookies
		//Game.Earn(cps/Game.fps);//add cookies per second
		
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			me.totalCookies+=(me.storedTotalCps*Game.globalCpsMult)/Game.fps;
		}
		if (Game.cookies && Game.T%Math.ceil(Game.fps/Math.min(10,Game.cookiesPs))==0 && Game.prefs.particles) Game.particleAdd();//cookie shower
		
		if (Game.T%(Game.fps*10)==0) Game.recalculateGains=1;//recalculate CpS every 10 seconds (for dynamic boosts such as Century egg)
		
		/*=====================================================================================
		UNLOCKING STUFF
		=======================================================================================*/
		if (Game.T%(Game.fps)==0 && Math.random()<1/500000) Game.Win('Just plain lucky');//1 chance in 500,000 every second achievement
		if (Game.T%(Game.fps*5)==0 && Game.ObjectsById.length>0)//check some achievements and upgrades
		{
			if (isNaN(Game.cookies)) {Game.cookies=0;Game.cookiesEarned=0;Game.recalculateGains=1;}
			
			var timePlayed=new Date();
			timePlayed.setTime(Date.now()-Game.startDate);
			
			if (!Game.fullDate || (Date.now()-Game.fullDate)>=365*24*60*60*1000) Game.Win('So much to do so much to see');
			
			if (Game.cookiesEarned>=1000000 && (Game.ascensionMode==1 || Game.resets==0))//challenge run or hasn't ascended yet
			{
				if (timePlayed<=1000*60*35) Game.Win('Speed baking I');
				if (timePlayed<=1000*60*25) Game.Win('Speed baking II');
				if (timePlayed<=1000*60*15) Game.Win('Speed baking III');
				
				if (Game.cookieClicks<=15) Game.Win('Neverclick');
				if (Game.cookieClicks<=0) Game.Win('True Neverclick');
				if (Game.cookiesEarned>=1000000000 && Game.UpgradesOwned==0) Game.Win('Hardcore');
			}
			
			for (var i in Game.UnlockAt)
			{
				var unlock=Game.UnlockAt[i];
				if (Game.cookiesEarned>=unlock.cookies)
				{
					var pass=1;
					if (unlock.require && !Game.Has(unlock.require) && !Game.HasAchiev(unlock.require)) pass=0;
					if (unlock.season && Game.season!=unlock.season) pass=0;
					if (pass) {Game.Unlock(unlock.name);Game.Win(unlock.name);}
				}
			}
			
			if (Game.Has('Golden switch')) Game.Unlock('Golden switch [off]');
			if (Game.Has('Shimmering veil') && !Game.Has('Shimmering veil [off]') && !Game.Has('Shimmering veil [on]')) {Game.Unlock('Shimmering veil [on]');Game.Upgrades['Shimmering veil [off]'].earn();}
			if (Game.Has('Sugar craving')) Game.Unlock('Sugar frenzy');
			if (Game.Has('Classic dairy selection')) Game.Unlock('Milk selector');
			if (Game.Has('Basic wallpaper assortment')) Game.Unlock('Background selector');
			if (Game.Has('Golden cookie alert sound')) Game.Unlock('Golden cookie sound selector');
			
			if (Game.Has('Prism heart biscuits')) Game.Win('Lovely cookies');
			if (Game.season=='easter')
			{
				var eggs=0;
				for (var i in Game.easterEggs)
				{
					if (Game.HasUnlocked(Game.easterEggs[i])) eggs++;
				}
				if (eggs>=1) Game.Win('The hunt is on');
				if (eggs>=7) Game.Win('Egging on');
				if (eggs>=14) Game.Win('Mass Easteria');
				if (eggs>=Game.easterEggs.length) Game.Win('Hide & seek champion');
			}
			
			if (Game.Has('Fortune cookies'))
			{
				var list=Game.Tiers['fortune'].upgrades;
				var fortunes=0;
				for (var i in list)
				{
					if (Game.Has(list[i].name)) fortunes++;
				}
				if (fortunes>=list.length) Game.Win('O Fortuna');
			}
			
			if (Game.Has('Legacy') && Game.ascensionMode!=1)
			{
				Game.Unlock('Heavenly chip secret');
				if (Game.Has('Heavenly chip secret')) Game.Unlock('Heavenly cookie stand');
				if (Game.Has('Heavenly cookie stand')) Game.Unlock('Heavenly bakery');
				if (Game.Has('Heavenly bakery')) Game.Unlock('Heavenly confectionery');
				if (Game.Has('Heavenly confectionery')) Game.Unlock('Heavenly key');
				
				if (Game.Has('Heavenly key')) Game.Win('Wholesome');
			}
		
			for (var i in Game.BankAchievements)
			{
				if (Game.cookiesEarned>=Game.BankAchievements[i].threshold) Game.Win(Game.BankAchievements[i].name);
			}
			
			var buildingsOwned=0;
			var mathematician=1;
			var base10=1;
			var minAmount=100000;
			for (var i in Game.Objects)
			{
				buildingsOwned+=Game.Objects[i].amount;
				minAmount=Math.min(Game.Objects[i].amount,minAmount);
				if (!Game.HasAchiev('Mathematician')) {if (Game.Objects[i].amount<Math.min(128,Math.pow(2,(Game.ObjectsById.length-Game.Objects[i].id)-1))) mathematician=0;}
				if (!Game.HasAchiev('Base 10')) {if (Game.Objects[i].amount<(Game.ObjectsById.length-Game.Objects[i].id)*10) base10=0;}
			}
			if (minAmount>=1) Game.Win('One with everything');
			if (mathematician==1) Game.Win('Mathematician');
			if (base10==1) Game.Win('Base 10');
			if (minAmount>=100) {Game.Win('Centennial');Game.Unlock('Milk chocolate butter biscuit');}
			if (minAmount>=150) {Game.Win('Centennial and a half');Game.Unlock('Dark chocolate butter biscuit');}
			if (minAmount>=200) {Game.Win('Bicentennial');Game.Unlock('White chocolate butter biscuit');}
			if (minAmount>=250) {Game.Win('Bicentennial and a half');Game.Unlock('Ruby chocolate butter biscuit');}
			if (minAmount>=300) {Game.Win('Tricentennial');Game.Unlock('Lavender chocolate butter biscuit');}
			if (minAmount>=350) {Game.Win('Tricentennial and a half');Game.Unlock('Synthetic chocolate green honey butter biscuit');}
			if (minAmount>=400) {Game.Win('Quadricentennial');Game.Unlock('Royal raspberry chocolate butter biscuit');}
			if (minAmount>=450) {Game.Win('Quadricentennial and a half');Game.Unlock('Ultra-concentrated high-energy chocolate butter biscuit');}
			if (minAmount>=500) {Game.Win('Quincentennial');Game.Unlock('Pure pitch-black chocolate butter biscuit');}
			if (minAmount>=550) {Game.Win('Quincentennial and a half');Game.Unlock('Cosmic chocolate butter biscuit');}
			if (minAmount>=600) {Game.Win('Sexcentennial');Game.Unlock('Butter biscuit (with butter)');}
			
			if (Game.handmadeCookies>=1000) {Game.Win('Clicktastic');Game.Unlock('Plastic mouse');}
			if (Game.handmadeCookies>=100000) {Game.Win('Clickathlon');Game.Unlock('Iron mouse');}
			if (Game.handmadeCookies>=10000000) {Game.Win('Clickolympics');Game.Unlock('Titanium mouse');}
			if (Game.handmadeCookies>=1000000000) {Game.Win('Clickorama');Game.Unlock('Adamantium mouse');}
			if (Game.handmadeCookies>=100000000000) {Game.Win('Clickasmic');Game.Unlock('Unobtainium mouse');}
			if (Game.handmadeCookies>=10000000000000) {Game.Win('Clickageddon');Game.Unlock('Eludium mouse');}
			if (Game.handmadeCookies>=1000000000000000) {Game.Win('Clicknarok');Game.Unlock('Wishalloy mouse');}
			if (Game.handmadeCookies>=100000000000000000) {Game.Win('Clickastrophe');Game.Unlock('Fantasteel mouse');}
			if (Game.handmadeCookies>=10000000000000000000) {Game.Win('Clickataclysm');Game.Unlock('Nevercrack mouse');}
			if (Game.handmadeCookies>=1000000000000000000000) {Game.Win('The ultimate clickdown');Game.Unlock('Armythril mouse');}
			if (Game.handmadeCookies>=100000000000000000000000) {Game.Win('All the other kids with the pumped up clicks');Game.Unlock('Technobsidian mouse');}
			if (Game.handmadeCookies>=10000000000000000000000000) {Game.Win('One...more...click...');Game.Unlock('Plasmarble mouse');}
			if (Game.handmadeCookies>=1000000000000000000000000000) {Game.Win('Clickety split');Game.Unlock('Miraculite mouse');}
			
			if (Game.cookiesEarned<Game.cookies) Game.Win('Cheated cookies taste awful');
			
			if (Game.Has('Skull cookies') && Game.Has('Ghost cookies') && Game.Has('Bat cookies') && Game.Has('Slime cookies') && Game.Has('Pumpkin cookies') && Game.Has('Eyeball cookies') && Game.Has('Spider cookies')) Game.Win('Spooky cookies');
			if (Game.wrinklersPopped>=1) Game.Win('Itchscratcher');
			if (Game.wrinklersPopped>=50) Game.Win('Wrinklesquisher');
			if (Game.wrinklersPopped>=200) Game.Win('Moistburster');
			
			if (Game.cookiesEarned>=1000000 && Game.Has('How to bake your dragon')) Game.Unlock('A crumbly egg');
			
			if (Game.cookiesEarned>=25 && Game.season=='christmas') Game.Unlock('A festive hat');
			if (Game.Has('Christmas tree biscuits') && Game.Has('Snowflake biscuits') && Game.Has('Snowman biscuits') && Game.Has('Holly biscuits') && Game.Has('Candy cane biscuits') && Game.Has('Bell biscuits') && Game.Has('Present biscuits')) Game.Win('Let it snow');
			
			if (Game.reindeerClicked>=1) Game.Win('Oh deer');
			if (Game.reindeerClicked>=50) Game.Win('Sleigh of hand');
			if (Game.reindeerClicked>=200) Game.Win('Reindeer sleigher');
			
			if (buildingsOwned>=100) Game.Win('Builder');
			if (buildingsOwned>=500) Game.Win('Architect');
			if (buildingsOwned>=1000) Game.Win('Engineer');
			if (buildingsOwned>=2000) Game.Win('Lord of Constructs');
			if (buildingsOwned>=4000) Game.Win('Grand design');
			if (buildingsOwned>=8000) Game.Win('Ecumenopolis');
			if (Game.UpgradesOwned>=20) Game.Win('Enhancer');
			if (Game.UpgradesOwned>=50) Game.Win('Augmenter');
			if (Game.UpgradesOwned>=100) Game.Win('Upgrader');
			if (Game.UpgradesOwned>=200) Game.Win('Lord of Progress');
			if (Game.UpgradesOwned>=300) Game.Win('The full picture');
			if (Game.UpgradesOwned>=400) Game.Win('When there\'s nothing left to add');
			if (buildingsOwned>=4000 && Game.UpgradesOwned>=300) Game.Win('Polymath');
			if (buildingsOwned>=8000 && Game.UpgradesOwned>=400) Game.Win('Renaissance baker');
			
			if (!Game.HasAchiev('Jellicles'))
			{
				var kittens=0;
				for (var i=0;i<Game.UpgradesByPool['kitten'].length;i++)
				{
					if (Game.Has(Game.UpgradesByPool['kitten'][i].name)) kittens++;
				}
				if (kittens>=10) Game.Win('Jellicles');
			}
			
			if (Game.cookiesEarned>=10000000000000 && !Game.HasAchiev('You win a cookie')) {Game.Win('You win a cookie');Game.Earn(1);}
			
			if (Game.shimmerTypes['golden'].n>=4) Game.Win('Four-leaf cookie');
			
			var grandmas=0;
			for (var i in Game.GrandmaSynergies)
			{
				if (Game.Has(Game.GrandmaSynergies[i])) grandmas++;
			}
			if (!Game.HasAchiev('Elder') && grandmas>=7) Game.Win('Elder');
			if (!Game.HasAchiev('Veteran') && grandmas>=14) Game.Win('Veteran');
			if (Game.Objects['Grandma'].amount>=6 && !Game.Has('Bingo center/Research facility') && Game.HasAchiev('Elder')) Game.Unlock('Bingo center/Research facility');
			if (Game.pledges>0) Game.Win('Elder nap');
			if (Game.pledges>=5) Game.Win('Elder slumber');
			if (Game.pledges>=10) Game.Unlock('Sacrificial rolling pins');
			if (Game.Objects['Cursor'].amount+Game.Objects['Grandma'].amount>=777) Game.Win('The elder scrolls');
			
			for (var i in Game.Objects)
			{
				var it=Game.Objects[i];
				for (var ii in it.productionAchievs)
				{
					if (it.totalCookies>=it.productionAchievs[ii].pow) Game.Win(it.productionAchievs[ii].achiev.name);
				}
			}
			
			if (!Game.HasAchiev('Cookie-dunker') && Game.LeftBackground && Game.milkProgress>0.1 && (Game.LeftBackground.canvas.height*0.4+256/2-16)>((1-Game.milkHd)*Game.LeftBackground.canvas.height)) Game.Win('Cookie-dunker');
			//&& l('bigCookie').getBoundingClientRect().bottom>l('milk').getBoundingClientRect().top+16 && Game.milkProgress>0.1) Game.Win('Cookie-dunker');
			
			Game.runModHook('check');
		}
		
		Game.cookiesd+=(Game.cookies-Game.cookiesd)*0.3;
		
		if (Game.storeToRefresh) Game.RefreshStore();
		if (Game.upgradesToRebuild) Game.RebuildUpgrades();
		
		Game.updateShimmers();
		Game.updateBuffs();
		
		Game.UpdateTicker();
	}
	
	Game.T++;
}

RPI.UpdateGrandmapocalypse=function()
{
	if (Game.Has('Elder Covenant') || Game.Objects['Grandma'].amount==0) Game.elderWrath=0;
	else if (Game.pledgeT>0)//if the pledge is active, lower it
	{
		Game.pledgeT--;
		if (Game.pledgeT==0)//did we reach 0? make the pledge purchasable again
		{
			Game.Lock('Elder Pledge');
			Game.Unlock('Elder Pledge');
			Game.elderWrath=1;
		}
	}
	else
	{
		if (Game.Has('One mind') && Game.elderWrath==0)
		{
			Game.elderWrath=1;
		}
		if (Math.random()<0.001 && Game.elderWrath<Game.Has('One mind')+Game.Has('Communal brainsweep')+Game.Has('Elder Pact'))
		{
			Game.elderWrath++;//have we already pledged? make the elder wrath shift between different stages
		}
		if (Game.Has('Elder Pact') && Game.Upgrades['Elder Pledge'].unlocked==0)
		{
			Game.Lock('Elder Pledge');
			Game.Unlock('Elder Pledge');
		}
	}
	Game.elderWrathD+=((Game.elderWrath+1)-Game.elderWrathD)*0.001;//slowly fade to the target wrath state
	
	if (Game.elderWrath!=Game.elderWrathOld) Game.storeToRefresh=1;
	
	Game.elderWrathOld=Game.elderWrath;
	
	RPI.UpdateWrinklers();
}

RPI.UpdateWrinklers=function()
{
//	var xBase=0;
//	var yBase=0;
//	var onWrinkler=0;
//	if (Game.LeftBackground)
//	{
//		xBase=Game.cookieOriginX;
//		yBase=Game.cookieOriginY;
//	}
	var max=Game.getWrinklersMax();
	var n=0;
//	for (var i in Game.wrinklers)
//	{
//		if (Game.wrinklers[i].phase>0) n++;
//	}
	var n = Game.wrinklers.filter(obj => obj.phase > 0).length
	for (var i in Game.wrinklers)
	{
		var me=Game.wrinklers[i];
		if (me.phase==0 && Game.elderWrath>0 && n<max && me.id<max)
		{
			var chance=0.00001*Game.elderWrath;
			chance*=Game.eff('wrinklerSpawn');
			if (Game.Has('Unholy bait')) chance*=5;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('scorn');
				if (godLvl==1) chance*=2.5;
				else if (godLvl==2) chance*=2;
				else if (godLvl==3) chance*=1.5;
			}
			if (Game.Has('Wrinkler doormat')) chance=0.1;
			if (Math.random()<chance)//respawn
			{
				Game.SpawnWrinkler(me);
			}
		}
		if (me.phase>0)
		{
			if (me.close<1) me.close+=(1/Game.fps)/10;
			if (me.close>1) me.close=1;
		}
		else me.close=0;
		if (me.close==1 && me.phase==1)
		{
			me.phase=2;
			Game.recalculateGains=1;
		}
		if (me.phase==2)
		{
			me.sucked+=(((Game.cookiesPs/Game.fps)*Game.cpsSucked));//suck the cookies
		}
		if (me.phase>0)
		{
			if (me.type==0)
			{
				if (me.hp<Game.wrinklerHP) me.hp+=0.04;
				me.hp=Math.min(Game.wrinklerHP,me.hp);
			}
			else if (me.type==1)
			{
				if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;
				me.hp=Math.min(Game.wrinklerHP*3,me.hp);
			}
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
//			var d=128*(2-me.close);//*Game.BigCookieSize;
//			if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
//			me.r=(me.id/max)*360;
//			if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
//			me.x=xBase+(Math.sin(me.r*Math.PI/180)*d);
//			me.y=yBase+(Math.cos(me.r*Math.PI/180)*d);
//			if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
//			var rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
//			if (Math.random()<0.01) me.hurt=Math.max(me.hurt,Math.random());
////			if (Game.T%5==0 && Game.CanClick) {if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect)) me.selected=1; else me.selected=0;}
//			if (me.selected && onWrinkler==0 && Game.CanClick)
//			{
//				me.hurt=Math.max(me.hurt,0.25);
//				//me.close*=0.99;
//				if (Game.Click && Game.lastClickedEl==l('backgroundLeftCanvas'))
//				{
//					if (Game.keys[17] && Game.sesame) {me.type=!me.type;PlaySound('snd/shimmerClick.mp3');}//ctrl-click on a wrinkler in god mode to toggle its shininess
//					else
//					{
//						Game.playWrinklerSquishSound();
//						me.hurt=1;
//						me.hp-=0.75;
//						if (Game.prefs.particles && !(me.hp<=0.5 && me.phase>0))
//						{
//							var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
//							var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
//							for (var ii=0;ii<3;ii++)
//							{
//								//Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
//								var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
//								part.r=-me.r;
//							}
//						}
//					}
//					Game.Click=0;
//				}
//				onWrinkler=1;
//			}
//		}
		
//		if (me.hurt>0)
//		{
//			me.hurt-=5/Game.fps;
//			//me.close-=me.hurt*0.05;
//			//me.x+=Math.random()*2-1;
//			//me.y+=Math.random()*2-1;
//			me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;
//		}
//		if (me.hp<=0.5 && me.phase>0)
//		{
//			Game.playWrinklerSquishSound();
//			PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
//			Game.wrinklersPopped++;
//			Game.recalculateGains=1;
//			me.phase=0;
//			me.close=0;
//			me.hurt=0;
//			me.hp=3;
//			var toSuck=1.1;
//			if (Game.Has('Sacrilegious corruption')) toSuck*=1.05;
//			if (me.type==1) toSuck*=3;//shiny wrinklers are an elusive, profitable breed
//			me.sucked*=toSuck;//cookie dough does weird things inside wrinkler digestive tracts
//			if (Game.Has('Wrinklerspawn')) me.sucked*=1.05;
//			if (Game.hasGod)
//			{
//				var godLvl=Game.hasGod('scorn');
//				if (godLvl==1) me.sucked*=1.15;
//				else if (godLvl==2) me.sucked*=1.1;
//				else if (godLvl==3) me.sucked*=1.05;
//			}
//			if (me.sucked>0.5)
//			{
//				if (Game.prefs.popups) Game.Popup('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler : found '+Beautify(me.sucked)+' cookies!');
//				else Game.Notify('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler','Found <b>'+Beautify(me.sucked)+'</b> cookies!',[19,8],6);
//				Game.Popup('<div style="font-size:80%;">+'+Beautify(me.sucked)+' cookies</div>',Game.mouseX,Game.mouseY);
//				
//				if (Game.season=='halloween')
//				{
//					//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
//					var failRate=0.95;
//					if (Game.HasAchiev('Spooky cookies')) failRate=0.8;
//					if (Game.Has('Starterror')) failRate*=0.9;
//					failRate*=1/Game.dropRateMult();
//					if (Game.hasGod)
//					{
//						var godLvl=Game.hasGod('seasons');
//						if (godLvl==1) failRate*=0.9;
//						else if (godLvl==2) failRate*=0.95;
//						else if (godLvl==3) failRate*=0.97;
//					}
//					if (me.type==1) failRate*=0.9;
//					if (Math.random()>failRate)//halloween cookie drops
//					{
//						var cookie=choose(['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies']);
//						if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
//						{
//							Game.Unlock(cookie);
//							if (Game.prefs.popups) Game.Popup('Found : '+cookie+'!');
//							else Game.Notify(cookie,'You also found <b>'+cookie+'</b>!',Game.Upgrades[cookie].icon);
//						}
//					}
//				}
//				Game.DropEgg(0.98);
//			}
//			if (me.type==1) Game.Win('Last Chance to See');
//			Game.Earn(me.sucked);
//			/*if (Game.prefs.particles)
//			{
//				var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
//				var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
//				for (var ii=0;ii<6;ii++)
//				{
//					Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
//				}
//			}*/
//			if (Game.prefs.particles)
//			{
//				var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
//				var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
//				if (me.sucked>0)
//				{
//					for (var ii=0;ii<5;ii++)
//					{
//						Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1.5,2);
//					}
//				}
//				for (var ii=0;ii<8;ii++)
//				{
//					var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
//					part.r=-me.r;
//				}
//			}
//			me.sucked=0;
//		}
//	}
//	if (onWrinkler)
//	{
//		Game.mousePointer=1;
//	}
}


for (var i=0; i<Game.fps*60*60*24; i++)
{
	RPI.Logic()
}

for (var i=0; i<function_list.length; i++)
{
	eval(eval('function_list[i]')+ '=RPI.original_functions[i]')
}