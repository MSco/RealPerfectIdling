/* ================================================
    MSco Cookie Stats - A Cookie Clicker plugin

    Version: 0.9.12
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
    		- Cookies in baked (this game and all time) includes wrinkler reward and chocolate egg reward
	- Show Cookies in bank needed to get the maximum reward of Lucky, a Frenzy-Lucky-Combo or a Dragon-Lucky-Combo 
	  (incl. time left to get it)
	- Show maximum of cookies you can spend without getting under the Frenz-Lucky optimized bank
	- Show reward for eldeers and elder frenzy with wrinklers
	- Show Cookies you would earn after popping all wrinklers
	- Show Cookies earned per hour with 10 active wrinklers
	- Show max. Cookies earned (includes sucked cookies and chocolate egg reward)
	- Show Heavenly Chips you would earn additionally after resetting this game (including sucked cookies and chocolate egg)
	- Calculate Base Cost per Income (BCI) for each building and show their efficiencies corresponding 
          the best BCI
        - Show how much cookies you have to generate (all time) to add a specified number of HCs (specified via number input)
        - Show Price for next Dragon Level

    Version History:

    0.9.12:
    	- Building price colors depend on efficiency
    	- MSco Stats Menu is shown in a table
    0.9.11:
    	- Added number input for HCs you want to generate this run
    	- Show Price for next Dragon Level
    	- Show the time left to get bank for Lucky-Combos
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

MS.BeautifyShort=function(value,floats)
{
	var negative=(value<0);
	var decimal='';
	if (value<1000000 && floats>0 && Math.floor(value.toFixed(floats))!=value.toFixed(floats)) decimal='.'+(value.toFixed(floats).toString()).split('.')[1];
	value=Math.floor(Math.abs(value));
	var formatter=numberFormatters[2];
	var output=formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	return negative?'-'+output:output+decimal;
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

MS.getWrinklersMax = function()
{
	return Game.version >= 1.9 ? Game.getWrinklersMax() : 10;
}

MS.wrinklersCPH = function()
{
	var wrinkFactor = MS.getWrinklersMax()*0.5*MS.getSuckFactor();
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

MS.timeLeftForBank = function(newbank)
{
	var cookiesLeft = Math.max(0, newbank - Game.cookies);
	var secondsLeft = cookiesLeft/(Game.cookiesPs*(1-Game.cpsSucked)/MS.frenzyMod());
	
	return secondsLeft * Game.fps;
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
	var wrinklersMax = MS.getWrinklersMax();
	var wrinkFactor = wrinklersMax*wrinklersMax*0.05*MS.getSuckFactor();
	wrinkFactor += (1-wrinklersMax*0.05);
	
	var time=Math.ceil(6*MS.getEffectDurMod());
		
	var moni = Game.cookiesPs / MS.frenzyMod() * wrinkFactor * 666 * time;
	return moni;
}

MS.neededCookiesForHC = function(HC)
{
	var hcsToAdd = 0;
	
	if (!(HC == null || isNaN(HC) || HC.length==0))
		var hcsToAdd = parseInt(HC);
	
	/*	
	if (Game.version >= 1.9)
	{
		var hcsOverallNeeded = Game.heavenlyChips + Game.heavenlyChipsSpent + hcsToAdd;
		return Math.pow(hcsOverallNeeded,3)*Math.pow(10,12);
	}
	else
	{
		var hcsOverallNeeded = Game.HowMuchPrestige(Game.cookiesReset) + hcsToAdd;
		return Game.HowManyCookiesReset(hcsOverallNeeded);
	}
	*/
	
	var hcsOverallNeeded = Game.HowMuchPrestige(Game.cookiesReset) + hcsToAdd;
	return Game.HowManyCookiesReset(hcsOverallNeeded);
}

MS.priceForBuildings = function(building, amount)
{
	var lowAmount = Math.max(building.amount-amount-building.free, 0);
	var highAmount = Math.max(Math.max(building.amount-amount,0)+amount-building.free, 0);
	var price = building.basePrice*(Math.pow(Game.priceIncrease, highAmount)-Math.pow(Game.priceIncrease, lowAmount))/0.15;
	if (Game.Has('Season savings')) price*=0.99;
	if (Game.Has('Santa\'s dominion')) price*=0.99;
	if (Game.Has('Faberge egg')) price*=0.99;
	if (Game.Has('Divine discount')) price*=0.99;
	if (Game.hasAura('Fierce Hoarder')) price*=0.98;
	
	return Math.ceil(price);
}

MS.priceForNextDragonLevel = function()
{
	if (Game.dragonLevel <= 4)
	{
		return 1000000 * Math.pow(2, Game.dragonLevel);
	}
	else if(Game.dragonLevel <= 18)
	{
		var building = Game.ObjectsById[Game.dragonLevel-5];
		return MS.priceForBuildings(building, 100);
	}
	else if(Game.dragonLevel == 19 || Game.dragonLevel == 20)
	{
		var price = 0;
		for (var i in Game.ObjectsById)
		{
			price += MS.priceForBuildings(Game.ObjectsById[i], (Game.dragonLevel == 19 ? 10 : 200));
		}
		return price;
	}
	else return 0;
}

if(!statsdone)
{
	// Replace strings in original Statistics menu
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label><br>\'+', 'when out of focus)</label><br>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
	// cookies in bank with wrinklers
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies in bank :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies)+\'</div></div>\'','<b>Cookies in bank (with wrinklers) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies+MS.wrinklersreward())+\'</div></div>\''));
	
	// Cookies per second: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesPs,1)', 'Beautify(Game.cookiesPs/MS.frenzyMod(),1)'));
	// Multiplier: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Math.round(Game.globalCpsMult*100),1)', 'Beautify(Math.round(Game.globalCpsMult*100/MS.frenzyMod()),1)'));

	// cookies baked
	var thisGameEarned = '<b>Cookies baked incl. wrinkl. and ch. egg (this game) :</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedThisGame()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (this game) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+\'</div></div>\'', thisGameEarned));	
	var allTimeEarned = '<b>Cookies baked incl. wrinkl. and ch. egg (all time):</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedAllTime()) + \'</div></div>\'';
	var chEggForBuildings = ' + \'<div class="listing"><b>Chocolate egg reward for buildings:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.chocolateEggSellReward()) + \'</div></div>\'';
	var chEggForBuildingsAndBank = ' + \'<div class="listing"><b>Chocolate egg reward for buildings + bank:</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.chocolateEggMaxReward()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (all time) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned+Game.cookiesReset)+\'</div></div>\'', allTimeEarned+chEggForBuildings+chEggForBuildingsAndBank));	

	var statsString;

	// Title
	statsString = '\'<br><div class="subsection">\' + \'<div class="title">MSco Stats</div>\'';
	
	//statsString += ' + \'<div class="listing"><span class="title" style="font-size:20px;"> Bank Stats </span></div>\'';
	
	// add blank line
	statsString += ' + \'<br>\'';
	
	// start lucky table
	statsString += ' + \'<table style="width: 100%;border-collapse: separate;">\'';
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Lucky</td> <td>Bank</td> <td>Max. Cookies to spend</td> <td>Time Left</td></tr>\'';
	// Lucky (plain, frenzy, dragon) bank + max to spend
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td><div class="price plain">\' + Beautify(MS.bankLucky()) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(1)) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankLucky())) > 0 ? Game.sayTime(time) : "done") + \'</b></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td><div class="price plain">\' + Beautify(MS.bankFrenzyLucky()) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(7)) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankFrenzyLucky())) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td><div class="price plain">\' + Beautify(MS.bankDragonLucky()) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(15)) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankDragonLucky())) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start cookie chain table
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Cookie Chains</td> <td>Bank</td> <td>Reward</td> <td>Next CPS</td></tr>\'';
	// Cookie Chain stats
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td><div class="price plain">\' + Beautify(MS.bankCookieChain(1)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(1)[0]) + \'</div></td><td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(1)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td><div class="price plain">\' + Beautify(MS.bankCookieChain(7)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(7)[0]) + \'</div></td><td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(7)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td><div class="price plain">\' + Beautify(MS.bankCookieChain(15)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(15)[0]) + \'</div></td><td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(15)[1]) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start Reindeer table
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Reindeers</td> <td>Plain</td> <td>Frenzy</td> <td>Dragon Harvest</td> <td>Elder Frenzy</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Reindeer reward:</b> </td><td><div class="price plain">\' + Beautify(MS.reindeerReward(1)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(7)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(15)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(666)) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start Heavenly Chips table
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Heavenly Chips</td> <td>Earned (this game)</td> <td>Earned (all time)</td> <td>Wanted (this game)</td> <td>Cookies needed (all time)</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Heavenly Chips:</b> </td><td> <b>\' + Beautify(MS.hcThisGame()) + \' (\' + Beautify(MS.hcFactor()) + \'%) </b> </td><td> <b>\' + Beautify(MS.hcAllTime()) + \'</b> </td><td> <input type=number id="tfHC" autofocus=true min=0 max=99999999 style="width:75%;" value=\' + (thisInput=(l("tfHC")==null ? \'0\' : l("tfHC").value)) + \'></input> </td><td class="price plain">\' + Beautify(MS.neededCookiesForHC(thisInput)) + \'</td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start wrinkler table
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Wrinklers</td> <td>Full Elder Frenzy</td> <td>Killing Wrinklers</td> <td>Real Cookies per Hour</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Wrinkler Rewards:</b></td> <td><div class="price plain">\' + Beautify(MS.maxElderFrenzy()) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.wrinklersreward()) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.wrinklersCPH()) + \'</div></td></tr>\'';
	
	// end table
	statsString += ' + \'<table>\'';

	// add blank line
	statsString += ' + \'<br>\'';

/*
	// BCI	
	statsString += ' + \'<br><div class="subsection">\' + \'<div class="title">Efficiency</div>\'';
	// start table
    	statsString += ' + \'<table>\'';
	statsString += ' + \'<tr><td><div class="listing"><b>' + Game.ObjectsById[0].name + ':</td><td></b> \' + Beautify(efc=MS.calcEfficiency(Game.ObjectsById[0], (best_bci=MS.calcBestBCI()))) + \'%\'+ \'</div></tr></td>\'';
	//eval('Game.ObjectsById[0].rebuild='+Game.ObjectsById[0].rebuild.toString().replace(searchStr, replaceStr));
	for (var i=1;i<Game.ObjectsN;i++)	
	{
		statsString += ' + \'<tr><td><div class="listing"><b>' + Game.ObjectsById[i].name + ':</td><td></b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById['+i+'], best_bci)) + \'%\'+ \'</div></tr></td>\'';
	}
	// end table
    	statsString += ' + \'<table>\'';
    	*/
	
	// Paste string into the menu
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Game.version+\'</div>\'+', 'Game.version+\'</div>\' + ' + statsString + ' + '));
	
	if(Game.version >= 1.9)
	{
		// Fix issue: Special Menu were not unlocked only for dragons
		//var searchBug='\\(\\(researchStr!=\'\' \\|\\| wrathStr!=\'\' \\|\\| pledgeStr!=\'\' \\|\\| santaStr!=\'\' \\|\\| Game.season!=\'\'\\)\\?';
		//var replaceBug='((researchStr!=\'\' || wrathStr!=\'\'|| pledgeStr!=\'\'|| santaStr!=\'\'|| Game.season!=\'\'|| dragonStr!=\'\')?';
		/***************** Remove this if Game.version > 1.9 !!!! *****************************/
		var searchBug=' Game.season!=\'\'';
		var replaceBug=' Game.season!=\'\'|| dragonStr!=\'\'';
		eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(searchBug, replaceBug));
		/*************************************************************************/
		
		// Price for next Dragon Level
		var search='\'<div class="listing"><b>Dragon training';
		var replaceDragon='\'<div class="listing"><b>Price for next Dragon Level:</b> <div class="price plain">\' + Beautify(MS.priceForNextDragonLevel()) + \'</div></div>\' + ';
		eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(search, replaceDragon + search));
		
		/*
		search = 'l(\'menu\').innerHTML=str;';
		var replaceTest = search + 'console.log(\'dragonStr: \' + dragonStr);'
		eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(search, replaceTest));
		*/
	}
	
	// Change Color of Building names:
	var searchStr = 'l(\'productPrice\'+me.id).innerHTML=Beautify(Math.round(me.price));';
	var replaceStr = 'var best_bci=MS.calcBestBCI(); var efc=MS.calcEfficiency(me, best_bci); if(efc>=100)var bcolor="#66ff4e";else if(efc>50)var bcolor="yellow";else var bcolor="#FF3232"; l(\'productPrice\'+me.id).innerHTML=Beautify(Math.round(me.price)) + \' (\'+Beautify(efc)+\'%)\'; l(\'productPrice\'+me.id).style.color=bcolor;'; //l(\'productPrice\'+me.id).style.color=bcolor;
	var thisRefresh = 'this.refresh();}';
	var allRefresh = 'for (var i in Game.ObjectsById) Game.ObjectsById[i].refresh();}';
	for (var i in Game.ObjectsById)
	{
		eval('Game.ObjectsById['+i+'].rebuild='+Game.ObjectsById[i].rebuild.toString().replace(searchStr, replaceStr));
		eval('Game.ObjectsById['+i+'].buy='+Game.ObjectsById[i].buy.toString().replace(thisRefresh, allRefresh));
		eval('Game.ObjectsById['+i+'].sell='+Game.ObjectsById[i].sell.toString().replace(thisRefresh, allRefresh));
		if (Game.version >= 1.9)
			eval('Game.ObjectsById['+i+'].sacrifice='+Game.ObjectsById[i].sacrifice.toString().replace(thisRefresh, allRefresh));
		Game.ObjectsById[i].refresh();
	}
	var searchActivateUpgrade = 'Game.UpgradesOwned++;';
	var replaceActivateUpgrade = '{ Game.UpgradesOwned++; } for (var i in Game.ObjectsById) Game.ObjectsById[i].refresh(); ';
	for (var i in Game.UpgradesById)
	{
		eval('Game.UpgradesById['+i+'].buy='+Game.UpgradesById[i].buy.toString().replace(searchActivateUpgrade, replaceActivateUpgrade));
	}
	//eval('Game.BuildStore='+Game.BuildStore.toString().replace('class="price" ', ''));
	//Game.BuildStore();
	
	/*
	var str='';
	for (var i in Game.Objects)
	{
		var me=Game.Objects[i];
		str+='<div class="product toggledOff" '+Game.getDynamicTooltip('Game.ObjectsById['+me.id+'].tooltip','store')+' id="product'+me.id+'"><div class="icon off" id="productIconOff'+me.id+'" style=""></div><div class="icon" id="productIcon'+me.id+'" style=""></div><div class="content"><div class="lockedTitle">???</div><div class="title" id="productName'+me.id+'"></div><span id="productPrice'+me.id+'"></span><div class="title owned" id="productOwned'+me.id+'"></div></div><div class="buySell"><div style="left:0px;" id="buttonBuy10-'+me.id+'">Buy 10</div><div style="left:100px;" id="buttonSell-'+me.id+'">Sell 1</div><div style="left:200px;" id="buttonSellAll-'+me.id+'">Sell all</div></div></div>';	
	}
	l('products').innerHTML=str;
	*/
	
	//l('products').innerHTML = l('products').innerHTML.replace(new RegExp('class="price" id="productPrice', 'g'), 'id="productPrice');
	//eval('l(\'products\').innerHTML='+l('products').innerHTML.toString().replace('class', 'class'));
	//l('productPrice0').innerHTML=l('productPrice0').innerHTML.replace('class="price" id="productPrice', 'id="productPrice');
	//l('products') = l('products');
	
	//searchStr = 'l(\'menu\').innerHTML=str;';
	//var addStr = 'for (var i in Game.ObjectsById) Game.ObjectsById[i].rebuild();';
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(searchStr, searchStr + addStr));
	
	Game.UpdateMenu();
	
	var statsdone = 1;
}
