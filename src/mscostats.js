/* ================================================
    MSco Cookie Stats - A Cookie Clicker plugin

    Version: 0.9.10.4
    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  Martin Schober
    Email:   martin.schober@gmx.de

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.

    Features:
    	- Original strings in statistics menu changed:
    		- Overloaded sayTime function: Time is displayed a bit more detailed now.
    		- cookies per second not affected by frenzy multipliers
    		- multiplier not affected by frenzy multipliers
    		- Cookies in bank includes wrinkler reward
	- Show Cookies in bank needed to get the maximum reward of a Frenzy-Lucky-Combo of Golden Cookies
	- Show maximum reward of a Frenzy-Lucky-Combo of Golden Cookies
	- Show maximum of cookies you can spend without getting under the Frenz-Lucky optimized bank
	- Show reward for eldeers and elder frenzy with wrinklers
	- Show Cookies you would earn after popping all wrinklers
	- Show Cookies earned per hour with 10 active wrinklers
	- Show max. Cookies earned (includes sucked cookies and chocolate egg reward)
	- Show Heavenly Chips you would earn additionally after resetting this game (including sucked cookies and chocolate egg)
	- Calculate Base Cost per Income (BCI) for each building and show their efficiencies corresponding 
          the best BCI
	

    Version History:

    0.9.10:
    	- Removed HC stuff
    	- Added Dragon Lucky Bank
    	- Added Cookie Chain
    0.9.9:
    	- Compatibility of beta 1.9
    0.9.8:
    	- Compatibility of beta 1.0501
    0.9.7:
    	- interface titles have been split up
    	- Cookies in bank includes wrinkler reward
    0.9.6:
    	- cps and multiplier statistic strings not affected by frenzy multipliers
    	- Show reward for eldeers and elder frenzy with wrinklers
    0.9.5:
    	- BCI is gerenerated by a dynamic loop
    	- Show Heavenly Chips earned all time
    	- Also show max Chocolate egg reward
    	- Max. cookies earned
    	- Check for Chocolate Upgrade unlocked and not used
    0.9.4:
	- Ads have been removed by orteil in v1.0465, so the ad remove code is not needed anymore.
    0.9.3:
	- Remove ads from easter update
    0.9.2:
	- Overloaded sayTime 
    0.9.1:
	- Regarding 'Wrinklerspawn' from Easter Upgrade for 'Full withered Cookies per hour' and 'Cookies rewarded killing wrinklers'
    0.9.0:
	- New method to calculate income of buildings: Simulate buy and calculate cps.
    0.8.2:
	- Regard Cookies to be rewarded killing wrinklers for calculation of Heavenly Chips earned this game
    0.8.1:
	- Modified some description strings (e.g. Frenzy Lucky instead of Frenzy+Lucky)
    0.8:
	- Initial Version with first features:
		- FL Bank, FL reward, spend cookies for FL bank
		- wrinklers reward, wrinklers cph
		- bci efficiency


================================================ */

var MS = {};

// set RPI.importSaveT after importing a save
MS.importSaveT = 0;
MS.importSaveCodeOrignal = Game.ImportSaveCode;
Game.ImportSaveCode = function(save)
{
    MS.importSaveCodeOrignal(save);
    MS.importSaveT = Game.T;
    MS.importSaveDate = new Date().getTime();
    console.log('MS.importSaveT: ' + MS.importSaveT);
    console.log('MS.importSaveDate: ' + MS.importSaveDate);
}

MS.GetHeavenlyMultiplierOriginal = Game.GetHeavenlyMultiplier;
Game.GetHeavenlyMultiplier=function()
{
	if (Game.beta==1 && Game.version==1.9)
	{
		var heavenlyMult=0;
		if (Game.Has('Heavenly chip secret')) heavenlyMult+=5;
		if (Game.Has('Heavenly cookie stand')) heavenlyMult+=20;
		if (Game.Has('Heavenly bakery')) heavenlyMult+=25;
		if (Game.Has('Heavenly confectionery')) heavenlyMult+=25;
		if (Game.Has('Heavenly key')) heavenlyMult+=25;
		if (Game.hasAura('Dragon God')) heavenlyMult*=1.05;
		heavenlyMult*=0.01
		return heavenlyMult;
	}
	else return MS.GetHeavenlyMultiplierOriginal();
}

Game.LoadSave=function(data)
	{
		var str='';
		if (data) str=unescape(data);
		else
		{
			if (Game.useLocalStorage)
			{
				var local=window.localStorage.getItem(Game.SaveTo);
				if (!local)//no localstorage save found? let's get the cookie one last time
				{
					if (document.cookie.indexOf(Game.SaveTo)>=0)
					{
						str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);
						document.cookie=Game.SaveTo+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
					}
					else return false;
				}
				else
				{
					str=unescape(local);
				}
			}
			else//legacy system
			{
				if (document.cookie.indexOf(Game.SaveTo)>=0) str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);//get cookie here
				else return false;
			}
		}
		
		if (str!='')
		{
			var version=0;
			var oldstr=str.split('|');
			if (oldstr[0]<1) {}
			else
			{
				str=str.split('!END!')[0];
				str=b64_to_utf8(str);
			}
			if (str!='')
			{
				var spl='';
				str=str.split('|');
				version=parseFloat(str[0]);
				
				if (isNaN(version) || str.length<5)
				{
					if (Game.prefs.popups) Game.Popup('Oops, looks like the import string is all wrong!');
					else Game.Notify('Error importing save','Oops, looks like the import string is all wrong!','',6,1);
					return false;
				}
				if (version>=1 && version>Game.version)
				{
					if (Game.prefs.popups) Game.Popup('Error : you are attempting to load a save from a future version (v.'+version+'; you are using v.'+Game.version+').');
					else Game.Notify('Error importing save','You are attempting to load a save from a future version (v.'+version+'; you are using v.'+Game.version+').','',6,1);
					return false;
				}
				if (version==1.0501)//prompt if we loaded from the 2014 beta
				{
					setTimeout(function(){Game.Prompt('<h3>New beta</h3><div class="block">Hey there! Unfortunately, your old beta save won\'t work here anymore; you\'ll have to start fresh or import your save from the live version.<div class="line"></div>Thank you for beta-testing Cookie Clicker, we hope you\'ll enjoy it and find strange and interesting bugs!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
					return false;
				}
				if (version<1.0501)//prompt if we loaded from the 2014 live version
				{
					setTimeout(function(){Game.Prompt('<h3>Update</h3><div class="block"><b>Hey there!</b> Cookie Clicker just received a pretty substantial update, and you might notice that some things have been moved around. Don\'t panic!<div class="line"></div>Your building numbers may look strange, making it seem like you own buildings you\'ve never bought; this is because we\'ve added <b>3 new buildings</b> after factories (and swapped mines and factories), offsetting everything after them. Likewise, some building-related upgrades and achievements may look a tad shuffled around. This is all perfectly normal!<div class="line"></div>We\'ve also rebalanced Heavenly Chips amounts and behavior.<br>You can now ascend through the <b>Legacy button</b> at the top!<div class="line"></div>Thank you for playing Cookie Clicker. We\'ve put a lot of work and care into this update and we hope you\'ll enjoy it!</div>',[['Neat!','Game.ClosePrompt();']]);},200);
				}
				if (version>=1)
				{
					spl=str[2].split(';');//save stats
					Game.startDate=parseInt(spl[0]);
					Game.fullDate=parseInt(spl[1]);
					Game.lastDate=parseInt(spl[2]);
					Game.bakeryName=spl[3]?spl[3]:Game.GetBakeryName();
					//prefs
					if (version<1.0503) spl=str[3].split('');
					else spl=unpack2(str[3]).split('');
					Game.prefs.particles=parseInt(spl[0]);
					Game.prefs.numbers=parseInt(spl[1]);
					Game.prefs.autosave=parseInt(spl[2]);
					Game.prefs.autoupdate=spl[3]?parseInt(spl[3]):1;
					Game.prefs.milk=spl[4]?parseInt(spl[4]):1;
					Game.prefs.fancy=parseInt(spl[5]);if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
					Game.prefs.warn=spl[6]?parseInt(spl[6]):0;
					Game.prefs.cursors=spl[7]?parseInt(spl[7]):0;
					Game.prefs.focus=spl[8]?parseInt(spl[8]):0;
					Game.prefs.format=spl[9]?parseInt(spl[9]):0;
					Game.prefs.notifs=spl[10]?parseInt(spl[10]):0;
					Game.prefs.wobbly=spl[11]?parseInt(spl[11]):0;
					Game.prefs.monospace=spl[12]?parseInt(spl[12]):0;
					BeautifyAll();
					spl=str[4].split(';');//cookies and lots of other stuff
					Game.cookies=parseFloat(spl[0]);
					Game.cookiesEarned=parseFloat(spl[1]);
					Game.cookieClicks=spl[2]?parseInt(spl[2]):0;
					Game.goldenClicks=spl[3]?parseInt(spl[3]):0;
					Game.handmadeCookies=spl[4]?parseFloat(spl[4]):0;
					Game.missedGoldenClicks=spl[5]?parseInt(spl[5]):0;
					Game.backgroundType=spl[6]?parseInt(spl[6]):0;
					Game.milkType=spl[7]?parseInt(spl[7]):0;
					Game.cookiesReset=spl[8]?parseFloat(spl[8]):0;
					Game.elderWrath=spl[9]?parseInt(spl[9]):0;
					Game.pledges=spl[10]?parseInt(spl[10]):0;
					Game.pledgeT=spl[11]?parseInt(spl[11]):0;
					Game.nextResearch=spl[12]?parseInt(spl[12]):0;
					Game.researchT=spl[13]?parseInt(spl[13]):0;
					Game.resets=spl[14]?parseInt(spl[14]):0;
					Game.goldenClicksLocal=spl[15]?parseInt(spl[15]):0;
					Game.cookiesSucked=spl[16]?parseFloat(spl[16]):0;
					Game.wrinklersPopped=spl[17]?parseInt(spl[17]):0;
					Game.santaLevel=spl[18]?parseInt(spl[18]):0;
					Game.reindeerClicked=spl[19]?parseInt(spl[19]):0;
					Game.seasonT=spl[20]?parseInt(spl[20]):0;
					Game.seasonUses=spl[21]?parseInt(spl[21]):0;
					Game.season=spl[22]?spl[22]:Game.baseSeason;
					var wrinklers={amount:spl[23]?spl[23]:0,number:spl[24]?spl[24]:0};
					Game.prestige=spl[25]?parseFloat(spl[25]):0;
					Game.heavenlyChips=spl[26]?parseFloat(spl[26]):0;
					Game.heavenlyChipsSpent=spl[27]?parseFloat(spl[27]):0;
					Game.heavenlyCookies=spl[28]?parseFloat(spl[28]):0;
					Game.ascensionMode=spl[29]?parseInt(spl[29]):0;
					Game.permanentUpgrades[0]=spl[30]?parseInt(spl[30]):-1;Game.permanentUpgrades[1]=spl[31]?parseInt(spl[31]):-1;Game.permanentUpgrades[2]=spl[32]?parseInt(spl[32]):-1;Game.permanentUpgrades[3]=spl[33]?parseInt(spl[33]):-1;Game.permanentUpgrades[4]=spl[34]?parseInt(spl[34]):-1;
					//if (version<1.05) {Game.heavenlyChipsEarned=Game.HowMuchPrestige(Game.cookiesReset);Game.heavenlyChips=Game.heavenlyChipsEarned;}
					Game.dragonLevel=spl[35]?parseInt(spl[35]):0;
					Game.dragonAura=spl[36]?parseInt(spl[36]):0;
					Game.dragonAura2=spl[37]?parseInt(spl[37]):0;
					Game.chimeType=spl[38]?parseInt(spl[38]):0;
					Game.volume=spl[39]?parseInt(spl[39]):50;
					
					spl=str[5].split(';');//buildings
					Game.BuildingsOwned=0;
					for (var i in Game.ObjectsById)
					{
						var me=Game.ObjectsById[i];
						if (spl[i])
						{
							var mestr=spl[i].toString().split(',');
							me.amount=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);me.totalCookies=parseInt(mestr[2]);me.specialUnlocked=0;//parseInt(mestr[3]);
							Game.BuildingsOwned+=me.amount;
						}
						else
						{
							me.amount=0;me.unlocked=0;me.bought=0;me.totalCookies=0;
						}
					}
					if (version<1.035)//old non-binary algorithm
					{
						spl=str[6].split(';');//upgrades
						Game.UpgradesOwned=0;
						for (var i in Game.UpgradesById)
						{
							var me=Game.UpgradesById[i];
							if (spl[i])
							{
								var mestr=spl[i].split(',');
								me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
								if (me.bought && me.pool!='debug') Game.UpgradesOwned++;
							}
							else
							{
								me.unlocked=0;me.bought=0;
							}
						}
						if (str[7]) spl=str[7].split(';'); else spl=[];//achievements
						Game.AchievementsOwned=0;
						for (var i in Game.AchievementsById)
						{
							var me=Game.AchievementsById[i];
							if (spl[i])
							{
								var mestr=spl[i].split(',');
								me.won=parseInt(mestr[0]);
							}
							else
							{
								me.won=0;
							}
							if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
						}
					}
					else if (version<1.0502)//old awful packing system
					{
						if (str[6]) spl=str[6]; else spl=[];//upgrades
						if (version<1.05) spl=UncompressLargeBin(spl);
						else spl=unpack(spl);
						Game.UpgradesOwned=0;
						for (var i in Game.UpgradesById)
						{
							var me=Game.UpgradesById[i];
							if (spl[i*2])
							{
								var mestr=[spl[i*2],spl[i*2+1]];
								me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
								if (me.bought && me.pool!='debug') Game.UpgradesOwned++;
							}
							else
							{
								me.unlocked=0;me.bought=0;
							}
						}
						if (str[7]) spl=str[7]; else spl=[];//achievements
						if (version<1.05) spl=UncompressLargeBin(spl);
						else spl=unpack(spl);
						Game.AchievementsOwned=0;
						for (var i in Game.AchievementsById)
						{
							var me=Game.AchievementsById[i];
							if (spl[i])
							{
								var mestr=[spl[i]];
								me.won=parseInt(mestr[0]);
							}
							else
							{
								me.won=0;
							}
							if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
						}
					}
					else
					{
						if (str[6]) spl=str[6]; else spl=[];//upgrades
						spl=unpack2(spl).split('');
						Game.UpgradesOwned=0;
						for (var i in Game.UpgradesById)
						{
							var me=Game.UpgradesById[i];
							if (spl[i*2])
							{
								var mestr=[spl[i*2],spl[i*2+1]];
								me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
								if (me.bought && me.pool!='debug') Game.UpgradesOwned++;
							}
							else
							{
								me.unlocked=0;me.bought=0;
							}
						}
						if (str[7]) spl=str[7]; else spl=[];//achievements
						spl=unpack2(spl).split('');
						Game.AchievementsOwned=0;
						for (var i in Game.AchievementsById)
						{
							var me=Game.AchievementsById[i];
							if (spl[i])
							{
								var mestr=[spl[i]];
								me.won=parseInt(mestr[0]);
							}
							else
							{
								me.won=0;
							}
							if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
						}
					}
					
					for (var i in Game.ObjectsById)
					{
						var me=Game.ObjectsById[i];
						if (me.buyFunction) me.buyFunction();
						me.setSpecial(0);
						if (me.special && me.specialUnlocked==1) me.special();
						me.refresh();
					}
					
					
					if (version<1.0503)//upgrades that used to be regular, but are now heavenly
					{
						var me=Game.Upgrades['Persistent memory'];me.unlocked=0;me.bought=0;
						var me=Game.Upgrades['Season switcher'];me.unlocked=0;me.bought=0;
					}
					
					if (Game.backgroundType==-1) Game.backgroundType=0;
					if (Game.milkType==-1) Game.milkType=0;
					
					
					//advance timers
					var framesElapsed=Math.ceil(((new Date().getTime()-Game.lastDate)/1000)*Game.fps);
					if (Game.pledgeT>0) Game.pledgeT=Math.max(Game.pledgeT-framesElapsed,1);
					if (Game.seasonT>0) Game.seasonT=Math.max(Game.seasonT-framesElapsed,1);
					if (Game.researchT>0) Game.researchT=Math.max(Game.researchT-framesElapsed,1);
					
					
					Game.ResetWrinklers();
					Game.LoadWrinklers(wrinklers.amount,wrinklers.number);
					
					//recompute season trigger prices
					if (Game.Has('Season switcher')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
					Game.computeSeasonPrices();
					
					//recompute prestige
					Game.prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset));
					if ((Game.heavenlyChips+Game.heavenlyChipsSpent)<Game.prestige)
					{Game.heavenlyChips=Game.prestige;Game.heavenlyChipsSpent=0;}//chips owned and spent don't add up to total prestige? set chips owned to prestige
		
		
					Game.CalculateGains();
					
					Game.bakeryNameRefresh();
					
					
					
					if (version==1.037 && Game.beta)//are we opening the new beta? if so, save the old beta to /betadungeons
					{
						window.localStorage.setItem('CookieClickerGameBetaDungeons',window.localStorage.getItem('CookieClickerGameBeta'));
						Game.Notify('Beta save data','Your beta save data has been safely exported to /betadungeons.',20);
					}
					else if (version==1.0501 && Game.beta)//are we opening the newer beta? if so, save the old beta to /oldbeta
					{
						window.localStorage.setItem('CookieClickerGameOld',window.localStorage.getItem('CookieClickerGameBeta'));
						//Game.Notify('Beta save data','Your beta save data has been safely exported to /oldbeta.',20);
					}
					else if (version==1.0466 && !Game.beta)//export the old 2014 version to /v10466
					{
						window.localStorage.setItem('CookieClickerGamev10466',window.localStorage.getItem('CookieClickerGame'));
						//Game.Notify('Beta save data','Your save data has been safely exported to /v10466.',20);
					}
					
					//compute cookies earned while the game was closed
					if (Game.mobile || Game.Has('Perfect idling') || Game.Has('Twin Gates of Transcendence'))
					{
						if (Game.Has('Perfect idling'))
						{
							var maxTime=60*60*24*1000000000;
							var percent=100;
						}
						else
						{
							var maxTime=60*60;
							if (Game.Has('Belphegor')) maxTime*=2;
							if (Game.Has('Mammon')) maxTime*=2;
							if (Game.Has('Abaddon')) maxTime*=2;
							if (Game.Has('Satan')) maxTime*=2;
							if (Game.Has('Asmodeus')) maxTime*=2;
							if (Game.Has('Beelzebub')) maxTime*=2;
							if (Game.Has('Lucifer')) maxTime*=2;
							
							var percent=5;
							if (Game.Has('Angels')) percent+=10;
							if (Game.Has('Archangels')) percent+=10;
							if (Game.Has('Virtues')) percent+=10;
							if (Game.Has('Dominions')) percent+=10;
							if (Game.Has('Cherubim')) percent+=10;
							if (Game.Has('Seraphim')) percent+=10;
							if (Game.Has('God')) percent+=10;
							
							if (Game.Has('Chimera')) {maxTime+=60*60*24*2;percent+=5;}
						}
						
						var timeOffline=(new Date().getTime()-Game.lastDate)/1000;
						console.log('Original timeOffline: ' + timeOffline);
						var timeOfflineOptimal=Math.min(timeOffline,maxTime);
						console.log('Original timeOfflineOptimal: ' + timeOfflineOptimal);
						var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
						console.log('Original timeOfflineReduced: ' + timeOfflineReduced);
						var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);
						console.log('Original Game.cookiesPs: ' + Game.cookiesPs);
						console.log('Original amount: ' + amount);
						
						if (amount>0)
						{
							if (Game.prefs.popups) Game.Popup('Earned '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s')+' while you were away');
							else Game.Notify('Welcome back!','You earned <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s')+' while you were away.<br>('+Game.sayTime(timeOfflineOptimal*Game.fps)+' at '+Math.floor(percent)+'% CpS'+(timeOfflineReduced?', plus '+Game.sayTime(timeOfflineReduced*Game.fps)+' at '+(Math.floor(percent*10)/100)+'%':'')+'.)',[Math.floor(Math.random()*16),11]);
							Game.Earn(amount);
						}
					}
					
				}
				else//importing old version save
				{
					Game.Notify('Error importing save','Sorry, you can\'t import saves from the old version anymore.','',6,1);
					return false;
				}
				
				
				Game.RebuildUpgrades();
				
				Game.TickerAge=0;
				
				Game.elderWrathD=0;
				Game.frenzy=0;
				Game.frenzyPower=1;
				Game.frenzyMax=0;
				Game.clickFrenzy=0;
				Game.clickFrenzyPower=1;
				Game.clickFrenzyMax=0;
				Game.recalculateGains=1;
				Game.storeToRefresh=1;
				Game.upgradesToRebuild=1;
				
				Game.goldenCookie.reset();
				Game.seasonPopup.reset();
				
				if (Game.prefs.popups) Game.Popup('Game loaded');
				else Game.Notify('Game loaded','','',1,1);
			}
		}
		else return false;
		return true;
	}

MS.EarnHeavenlyChipsOriginal = Game.EarnHeavenlyChips;
Game.EarnHeavenlyChips=function(cookiesForfeited)
{
	if (Game.beta==1 && Game.version==1.9)
	{
		//recalculate prestige and chips owned
		var prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+cookiesForfeited));
		if (prestige>Game.prestige)//did we gain prestige levels?
		{
			var prestigeDifference=prestige-Game.prestige;
			Game.heavenlyChips+=prestige-Game.heavenlyChips-Game.heavenlyChipsSpent;
			Game.prestige=prestige;
			if (Game.prefs.popups) Game.Popup('You gain '+Beautify(prestigeDifference)+' prestige level'+(prestigeDifference==1?'':'s')+'!');
			else Game.Notify('You forfeit your '+Beautify(cookiesForfeited)+' cookies.','You gain <b>'+Beautify(prestigeDifference)+'</b> prestige level'+(prestigeDifference==1?'':'s')+'!',[19,7]);
		}
	}
	else return MS.EarnHeavenlyChipsOriginal();
}

// Remove this function if Game.Version>=1.9
MS.getEffectDurMod=function()
{
	var dur=1;
	if (Game.Has('Get lucky')) dur*=2;
	if (Game.Has('Lasting fortune')) dur*=1.1;
	return dur;
}
/***********************************************/

Game.sayTime = function(time,detail)
{	
	var str='';
	time=Math.floor(time);

	var seconds = Math.floor(time/Game.fps);
	var minutes = Math.floor(time/(Game.fps*60));
	var hours = Math.floor(time/(Game.fps*60*60));
	var days = Math.floor(time/(Game.fps*60*60*24));

	var numStrings = 0;

	if (days > 0 && numStrings<2)
	{
		str += days + ' days';
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (hours > 0 && numStrings<2)
	{
		str += (hours-days*24) + ' hours';
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (minutes > 0 && numStrings<2)
	{
		str += (minutes-hours*60) + ' minutes';
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (seconds > 0 && numStrings<2)
	{
		str += Math.floor(time/Game.fps) - minutes*60 + ' seconds';
		numStrings++;
	}

	return str;
}

MS.maxEarnedThisGame = function()
{
	return (Game.cookiesEarned + MS.wrinklersreward() + MS.chocolateEggMaxReward());
}

MS.maxEarnedAllTime = function()
{
	return (MS.maxEarnedThisGame() + Game.cookiesReset);
}

MS.hcAllTime = function()
{
	return Game.HowMuchPrestige(MS.maxEarnedAllTime());	
}

MS.hcThisGame = function()
{
	return (MS.hcAllTime() - Game.HowMuchPrestige(Game.cookiesReset));	
}

MS.buildingSellReward = function(building)
{
	var buildingfree = (Game.version >= 1.9) ? building.free : 0;
	var buildingamount = building.amount;
	if (Game.version >= 1.9)
		if (building.id == Game.ObjectsN-1 && Game.dragonLevel>=9 && !Game.hasAura('Earth Shatterer'))
			buildingamount--;
	
	var price = Math.ceil(building.basePrice * (Math.pow(Game.priceIncrease, Math.max(0,building.amount-buildingfree)+1) - Game.priceIncrease) / 0.15);
	
	var giveBack=0.5;
	if (Game.version >= 1.9)
		if (Game.dragonLevel>=9) 
			giveBack=0.85
	
	var reward = price * giveBack;
	
	if (Game.Has('Season savings')) reward*=0.99;
	if (Game.Has('Santa\'s dominion')) reward*=0.99;
	if (Game.Has('Faberge egg')) reward*=0.99;
	if (Game.Has('Divine discount')) reward*=0.99;
	
	if (Game.version >= 1.9)
        	if (Game.hasAura('Fierce Hoarder')) price*=0.98;
	
	return reward;
}

MS.sellAllReward = function()
{
	var reward = 0;
	for (var i=0; i<Game.ObjectsN; i++)
	{
		reward += MS.buildingSellReward(Game.ObjectsById[i]);
	}
	
	return reward;
}

MS.chocolateEggSellReward = function()
{
	return (MS.sellAllReward()*0.05)*Game.HasUnlocked('Chocolate egg')*!Game.Has('Chocolate egg');
}

MS.chocolateEggMaxReward = function()
{
	return (MS.chocolateEggSellReward() + (Game.cookies+MS.wrinklersreward())*0.05)*Game.HasUnlocked('Chocolate egg')*!Game.Has('Chocolate egg');
}

MS.hcFactor = function()
{
	return Math.round(MS.hcThisGame()/Game.HowMuchPrestige(Game.cookiesReset) * 100);	
}

MS.getSuckFactor = function()
{
	var suckFactor = 1.1;
	if (Game.Has('Sacrilegious corruption'))
		suckFactor *= 1.05;
	if (Game.Has('Wrinklerspawn'))
		suckFactor *= 1.05;
		
	return suckFactor;
}

MS.wrinklersreward = function()
{
	var suckFactor = MS.getSuckFactor();
	return Game.wrinklers.reduce(function(p,c)
		{
			var shinySuckfactor = suckFactor
			if (c.type==1) shinySuckfactor*=3;
			return p + shinySuckfactor*c.sucked
			
		},0);	
}

MS.wrinklersMax = function()
{
	return Game.version >= 1.9 ? Game.getWrinklersMax() : 10;
}

MS.wrinklersCPH = function()
{
	var wrinkFactor = MS.wrinklersMax()*0.5*MS.getSuckFactor();
	wrinkFactor += 0.5

	return Game.cookiesPs / MS.frenzyMod() * wrinkFactor * 3600;
}

MS.simulateToggle = function(building, buyOrReverse)
{
	if (building.amount>0)
	{
		if (buyOrReverse) 
		{
	        	building.amount++;
		        building.bought++;
	        }
		else 
		{
	        	building.amount--;
		        building.bought--;
	        }
	}
}

MS.getBuildingWorth = function(building)
{
	MS.simulateToggle(building, true);
	Game.CalculateGains();

	var income = Game['cookiesPs']/MS.frenzyMod();

	MS.simulateToggle(building, false);
	Game.CalculateGains();

	return income - Game['cookiesPs']/MS.frenzyMod();
}

MS.getBCI = function(building)
{
	return building.price/MS.getBuildingWorth(building);
}

MS.calcBestBCI = function()
{
	var best_bci = Number.POSITIVE_INFINITY;
	for (var i=0; i<Game.ObjectsN; i++) 
	{
		var bci = MS.getBCI(Game.ObjectsById[i]);
		if (bci > -1)
		{
			best_bci = Math.min(bci, best_bci);
		}
	}

	return best_bci;
}

MS.calcEfficiency = function(building, bestbci)
{
	var bci = MS.getBCI(building);
	if (bci < 0) 
	{
		return 0;
	}
	else
	{
		return bestbci/bci*100;
	}
}

MS.frenzyMod = function()
{
	return ((Game.frenzy > 0) ? Game.frenzyPower : 1);
}

MS.goldenMult = function()
{
	var mult=1;
	if (Game.version >= 1.9)
	{
		if (Game.elderWrath>0 && Game.hasAura('Unholy Dominion')) mult*=1.1;
		else if (Game.elderWrath==0 && Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
	}
	
	return mult;
}

MS.bankLucky = function()
{
	return Game.cookiesPs / MS.frenzyMod() * 1200 * 10 * MS.goldenMult() + 13;
}

MS.bankFrenzyLucky = function()
{
	var mult = 1;
	if (Game.version >= 1.9)
		if (Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
	
	return Game.cookiesPs / MS.frenzyMod() * 1200 * 10 * 7 * mult + 13;
}

MS.bankDragonLucky = function()
{
	return Game.cookiesPs / MS.frenzyMod() * 1200 * 10 * 15 * MS.goldenMult() + 13;
}

MS.bankCookieChain = function(frenzyMultiplier)
{
	return (MS.maxCookieChainReward(frenzyMultiplier)[0])*4;
}

MS.maxCookieChainReward = function(frenzyMultiplier)
{
	var digit = (Game.elderWrath < 3 || frenzyMultiplier == 7) ? 7 : 6;
	var mult = MS.goldenMult();
	
	var chain = 0;
	var moni = 0, nextMoni = 0;
	while (moni < Game.cookiesPs*frenzyMultiplier/MS.frenzyMod()*60*60*3*mult)
	{
		chain++;
		moni = Math.max(digit,Math.floor(1/9*Math.pow(10,chain)*digit*mult));
	}
	
	moni = Math.max(digit,Math.floor(1/9*Math.pow(10,chain-1)*digit*mult));
	var nextCps = Math.max(digit,Math.floor(1/9*Math.pow(10,chain)*digit*mult))/(60*60*3*mult*frenzyMultiplier);
	
	return [moni, nextCps];
}

MS.cookiesToSpend = function(frenzyMultiplier)
{
	if (frenzyMultiplier == 1)
		return Game.cookies - MS.bankLucky();
	if (frenzyMultiplier == 7)
		return Game.cookies - MS.bankFrenzyLucky();
	if (frenzyMultiplier == 15)
        	return Game.cookies - MS.bankDragonLucky();
}

MS.reindeerReward = function(frenzyMultiplier)
{
	var moni=Math.max(25,Game.cookiesPs/MS.frenzyMod()*frenzyMultiplier*60*1);//1 minute of cookie production, or 25 cookies - whichever is highest
	if (Game.Has('Ho ho ho-flavored frosting')) moni*=2;
	
	return moni;
}

MS.maxElderFrenzy = function()
{
	var wrinklersMax = MS.wrinklersMax();
	var wrinkFactor = wrinklersMax*wrinklersMax*0.05*MS.getSuckFactor();
	wrinkFactor += (1-wrinklersMax*0.05);
	
	var time=Math.ceil(6*MS.getEffectDurMod());
		
	var moni = Game.cookiesPs / MS.frenzyMod() * wrinkFactor * 666 * time;
	return moni;
}

if(!statsdone)
{
	// not needed anymore since v1.0465
	/*
	l('sectionAd').style.display = 'none';
	document.getElementsByClassName('separatorRight')[0].style.right = '317px';
	l('sectionMiddle').style.right = '318px';
	l('sectionRight').style.right = '0px';
	*/
	
	
	// Replace strings in original Statistics menu
	
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies in bank :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies)+\'</div></div>\'','<b>Cookies in bank (with wrinklers) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies+MS.wrinklersreward())+\'</div></div>\''));
	
	// Cookies per second: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesPs,1)', 'Beautify(Game.cookiesPs/MS.frenzyMod(),1)'));
	// Multiplier: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Math.round(Game.globalCpsMult*100),1)', 'Beautify(Math.round(Game.globalCpsMult*100/MS.frenzyMod()),1)'));
	
	var thisGameEarned = ' + \'<div class="listing"><b>Incl. wrinklers and chocolate egg:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedThisGame()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesEarned)+\'</div></div>\'', 'Beautify(Game.cookiesEarned)+\'</div></div>\'' + thisGameEarned));
	var allTimeEarned = ' + \'<div class="listing"><b>Incl. wrinklers and chocolate egg:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedAllTime()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesEarned+Game.cookiesReset)+\'</div></div>\'', 'Beautify(Game.cookiesEarned+Game.cookiesReset)+\'</div></div>\'' + allTimeEarned));


	var statsString;

	// Title
	statsString = '\'<br><div class="subsection">\' + \'<div class="title">MSco Stats</div>\'';

	// Lucky bank
	statsString += ' + \'<div class="listing"><b>Bank for Lucky:</b> <div class="price plain">\' + Beautify(MS.bankLucky()) + \'</div></div>\'';
	// Frenzy + Lucky bank
	statsString += ' + \'<div class="listing"><b>Bank for Frenzy Lucky:</b> <div class="price plain">\' + Beautify(MS.bankFrenzyLucky()) + \'</div></div>\'';
	// Dragon + Lucky bank
	statsString += ' + \'<div class="listing"><b>Bank for Dragon Lucky:</b> <div class="price plain">\' + Beautify(MS.bankDragonLucky()) + \'</div></div>\'';
	// Cookie Chain bank
	statsString += ' + \'<div class="listing"><b>Bank for Cookie Chain:</b> <div class="price plain">\' + Beautify(MS.bankCookieChain(1)) + \'</div>, <b>Frenzy: </b><div class="price plain">\' + Beautify(MS.bankCookieChain(7)) + \'</div>, <b>Dragon: </b><div class="price plain">\' + Beautify(MS.bankCookieChain(15)) + \'</div></div>\'';
	// Cookie Chain reward
	statsString += ' + \'<div class="listing"><b>Max. Cookie Chain Reward:</b> <div class="price plain">\' + Beautify(MS.maxCookieChainReward(1)[0]) + \'</div>, <b>F: </b><div class="price plain">\' + Beautify(MS.maxCookieChainReward(7)[0]) + \'</div>, <b>D: </b><div class="price plain">\' + Beautify(MS.maxCookieChainReward(15)[0]) + \'</div></div>\'';
	// Next Cps for Cookie Chain
	statsString += ' + \'<div class="listing"><b>Next CPS for Cookie Chain:</b> <div class="price plain">\' + Beautify(MS.maxCookieChainReward(1)[1]) + \'</div>, <b>F: </b><div class="price plain">\' + Beautify(MS.maxCookieChainReward(7)[1]) + \'</div>, <b>D: </b><div class="price plain">\' + Beautify(MS.maxCookieChainReward(15)[1]) + \'</div></div>\'';
	// Cookies to spend
	statsString += ' + \'<div class="listing"><b>Max. Cookies to Spend:</b> <div class="price plain">\' + Beautify(MS.cookiesToSpend(1)) + \'</div>, <b>F: </b><div class="price plain">\' + Beautify(MS.cookiesToSpend(7)) + \'</div>, <b>D: </b><div class="price plain">\' + Beautify(MS.cookiesToSpend(15)) + \'</div></div>\'';

	// Eldeer reward
	statsString += ' + \'<div class="listing"><b>Reindeer:</b> <div class="price plain">\' + Beautify(MS.reindeerReward(1)) + \'</div>, <b>F: </b><div class="price plain">\' + Beautify(MS.reindeerReward(7)) + \'</div>, <b>D: </b><div class="price plain">\' + Beautify(MS.reindeerReward(15)) + \'</div>, <b>Elder: </b><div class="price plain">\' + Beautify(MS.reindeerReward(666)) + \'</div></div>\'';
	// Elder frenzy reward
	statsString += ' + \'<div class="listing"><b>Max. Elder Frenzy Reward (\'+MS.wrinklersMax()+\' wrinklers):</b> <div class="price plain">\' + Beautify(MS.maxElderFrenzy()) + \'</div></div>\'';

	// Rewarded by Wrinklers
	statsString += ' + \'<div class="listing"><b>Cookies Rewarded killing Wrinklers:</b> <div class="price plain">\' + Beautify(MS.wrinklersreward()) + \'</div></div>\'';

	// Real Withered Cookies Per Hour
	statsString += ' + \'<div class="listing"><b>Real Withered Cookies per Hour:</b> <div class="price plain">\' + Beautify(MS.wrinklersCPH()) + \'</div></div>\'';

	// add blank line
	statsString += ' + \'<br>\'';

	if (Game.version < 1.9)
	{
	// HCs earned
	statsString += ' + \'<div class="listing"><b>HCs earned this game:</b> \' + Beautify(MS.hcThisGame()) + \' (\' + Beautify(MS.hcFactor()) + \'% of current HC) </div>\'';
	statsString += ' + \'<div class="listing"><b>HCs earned all time:</b> \' + Beautify(MS.hcAllTime()) + \'</div>\'';
	}
	
	// Chocolate Egg reward
	statsString += ' + \'<div class="listing"><b>Chocolate egg reward for buildings:</b> <div class="price plain">\' + Beautify(MS.chocolateEggSellReward()) + \'</div></div>\'';
	statsString += ' + \'<div class="listing"><b>Chocolate egg reward for buildings + bank:</b> <div class="price plain">\' + Beautify(MS.chocolateEggMaxReward()) + \'</div></div>\'';
	
	
	// add blank line
	//statsString += ' + \'<br>\'';
	statsString += ' + \'<br><div class="subsection">\' + \'<div class="title">Efficiency</div>\'';

	// BCI
	statsString += ' + \'<div class="listing"><b>' + Game.ObjectsById[0].name + ':</b> \' + Beautify(efc=MS.calcEfficiency(Game.ObjectsById[0], (best_bci=MS.calcBestBCI()))) + \'%\'+ \'</div>\'';
	for (var i=1;i<Game.ObjectsN;i++)	
	{
		statsString += ' + \'<div class="listing"><b>' + Game.ObjectsById[i].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById['+i+'], best_bci)) + \'%\'+ \'</div>\'';
	}

	
	// Paste string into the menu
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Game.version+\'</div>\'+', 'Game.version+\'</div>\' + ' + statsString + ' + '));

	var statsdone = 1;
}
