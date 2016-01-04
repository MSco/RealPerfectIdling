/* ================================================
    MSco Cookie Stats - A Cookie Clicker plugin

    Version: 0.9.10.5
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

// set MS.importSaveT after importing a save
MS.importSaveT = 0;
MS.importSaveDate = new Date().getTime() - Game.T*1000/Game.fps;
MS.saveImported = false;
MS.importSaveCodeOrignal = Game.ImportSaveCode;
Game.ImportSaveCode = function(save)
{
    MS.importSaveCodeOrignal(save);
    MS.importSaveT = Game.T;
    MS.importSaveDate = new Date().getTime();
    
    if (save && save!='')
    {
    	var str=unescape(save);
    	MS.readPledgeFromStr(str);
    }
    
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

MS.readPledgeFromStr=function(str)
{
	var oldstr=str.split('|');
	if (oldstr[0]<1) {}
	else
	{
		str=str.split('!END!')[0];
		str=b64_to_utf8(str);
	}
	str=str.split('|');
    	var spl=str[4].split(';');
    	Game.pledgeT=spl[11]?parseInt(spl[11]):0;
    	MS.saveImported = true;
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
	// Replace strings in original Statistics menu
	
	// cookies in bank with wrinklers
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies in bank :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies)+\'</div></div>\'','<b>Cookies in bank (with wrinklers) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies+MS.wrinklersreward())+\'</div></div>\''));
	
	// Cookies per second: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesPs,1)', 'Beautify(Game.cookiesPs/MS.frenzyMod(),1)'));
	// Multiplier: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Math.round(Game.globalCpsMult*100),1)', 'Beautify(Math.round(Game.globalCpsMult*100/MS.frenzyMod()),1)'));

	// cookies baked
	var thisGameEarned = '<b>Cookies baked (this game, incl. wrinkl. and ch. egg:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedThisGame()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (this game) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+\'</div></div>\'', thisGameEarned);	
	var allTimeEarned = '<b>Cookies baked (all time, incl. wrinkl. and ch. egg:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedAllTime()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (all time) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned+Game.cookiesReset)+\'</div></div>\'', allTimeEarned);	

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
