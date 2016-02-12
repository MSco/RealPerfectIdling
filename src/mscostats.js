/* ================================================
    MSco Cookie Stats - A Cookie Clicker plugin

    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  MSco
    Contact: https://www.reddit.com/user/_MSco_

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.
    
================================================ */

var MS = {};

MS.version = '1.0.7.0'

// set MS.importSaveT after importing a save, this is exclusively for another MSco Addon: Real Perfect Idling
MS.importSaveT = 0;
MS.importSaveDate = new Date().getTime() - Game.T*1000/Game.fps;
MS.saveImported = false;
MS.pledgeT = 0;
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
    	MS.pledgeT=spl[11]?parseInt(spl[11]):0;
    	MS.saveImported = true;
}

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
	var buildingamount = building.amount;
	if (building.id == Game.ObjectsN-1 && Game.dragonLevel>=9 && !Game.hasAura('Earth Shatterer'))
		buildingamount--;
	
	var price = Math.ceil(building.basePrice * (Math.pow(Game.priceIncrease, Math.max(0,building.amount-building.free)+1) - Game.priceIncrease) / 0.15);
	
	var giveBack = (Game.dragonLevel>=9) ? 0.85 : 0.5;
	
	var reward = price * giveBack;
	
	if (Game.Has('Season savings')) reward*=0.99;
	if (Game.Has('Santa\'s dominion')) reward*=0.99;
	if (Game.Has('Faberge egg')) reward*=0.99;
	if (Game.Has('Divine discount')) reward*=0.99;
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

MS.wrinklersCPH = function()
{
	var wrinkFactor = Game.getWrinklersMax()*0.5*MS.getSuckFactor();
	wrinkFactor += 0.5

	return Game.cookiesPs / MS.frenzyMod() * MS.goldenSwitchMod(true) * wrinkFactor * 3600;
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

MS.bci = [];
MS.efc = [];

MS.getBCI = function(building)
{
	return building.price/MS.getBuildingWorth(building);
}

MS.calcBestBCI = function()
{
	var bestbci = Number.POSITIVE_INFINITY;
	for (var i=0; i<Game.ObjectsN; i++) 
	{
		MS.bci[i] = MS.getBCI(Game.ObjectsById[i]);
		
		if (MS.bci[i] > -1)
		{
			bestbci = Math.min(MS.bci[i], bestbci);
		}
	}

	return bestbci;
}

MS.calcEfficiency = function(building, bestbci)
{
	var bci = MS.bci[building.id];
	MS.efc[building.id] = (bci >= 0) ? bestbci/bci*100 : 0;
	
	return MS.efc[building.id];
}

MS.calcEfficiencies = function()
{
	var bestbci = MS.calcBestBCI();
	for (var i=0; i<Game.ObjectsN; i++) 
	{
		MS.calcEfficiency(Game.ObjectsById[i], bestbci);
	}
}

MS.refreshBuildingPrice = function(building)
{
	var efc = MS.efc[building.id];
	if(efc>=100) 
		var bcolor="#66ff4e";
	else if(efc>50) 
		var bcolor="yellow";
	else 
		var bcolor="#FF3232";
	l('productPrice'+building.id).innerHTML=Beautify(Math.round(building.bulkPrice)) + '(' + Beautify(efc) + '%)';
	l('productPrice'+building.id).style.color=bcolor;
}

MS.frenzyMod = function()
{
	return ((Game.frenzy > 0) ? Game.frenzyPower : 1);
}

MS.goldenSwitchMod = function(addMultiplier)
{
	var goldenSwitchMult=1.0;
	
	var useSwitchMod;
	if (addMultiplier)
		useSwitchMod = Game.HasUnlocked('Golden switch') && Game.Has('Golden switch [on]');
	else
		useSwitchMod = Game.HasUnlocked('Golden switch') && Game.Has('Golden switch [off]')
	
	if (useSwitchMod)
	{
		goldenSwitchMult=1.5;
		if (Game.Has('Residual luck'))
		{
			var upgrades=['Get lucky','Lucky day','Serendipity','Heavenly luck','Lasting fortune','Decisive fate'];
			for (var i in upgrades) {if (Game.Has(upgrades[i])) goldenSwitchMult+=0.1;}
		}
	}
	
	return goldenSwitchMult;
}

MS.goldenMult = function()
{
	var mult=1;
	
	if (Game.elderWrath>0 && Game.hasAura('Unholy Dominion')) mult*=1.1;
	else if (Game.elderWrath==0 && Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
	
	return mult;
}

MS.timeLeftForBank = function(newbank)
{
	var cookiesLeft = Math.max(0, newbank - Game.cookies);
	var secondsLeft = cookiesLeft/(Game.cookiesPs*(1-Game.cpsSucked)/MS.frenzyMod());
	
	return secondsLeft * Game.fps;
}

MS.timeLeftForCookies = function(cookies)
{
	var cookiesLeft = Math.max(0, cookies - Game.cookies - MS.wrinklersreward());
	var secondsLeft = cookiesLeft/MS.wrinklersCPH();
	
	return secondsLeft * 60 * 60 * Game.fps;
}

MS.bankLucky = function(frenzyMultiplier)
{
	return 1.0/0.15 * Game.cookiesPs / MS.frenzyMod() / MS.goldenSwitchMod(false) * 60 * 15 * frenzyMultiplier;
}

MS.maxLuckyReward = function(frenzyMultiplier)
{
	var mult = MS.goldenMult();
	if (frenzyMultiplier == 7)
	{
		mult = 1;
		if (Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
	}
	
	return 0.15 * MS.bankLucky(frenzyMultiplier) * mult + 13;
}

MS.maxCookieChainReward = function(frenzyMultiplier)
{
	if (frenzyMultiplier == 0.5)
		var digit = 6;
	else if (frenzyMultiplier == 7)
		var digit = 7;
	else
		var digit = (Game.elderWrath < 3) ? 7 : 6;
		
	var mult = MS.goldenMult();
	
	var chain = 0;
	var moni = 0;
	while (moni < Game.cookiesPs*frenzyMultiplier/MS.frenzyMod()/MS.goldenSwitchMod(false)*60*60*6*mult)
	{
		chain++;
		moni = Math.max(digit,Math.floor(1/9*Math.pow(10,chain)*digit*mult));
	}
	
	moni = Math.max(digit,Math.floor(1/9*Math.pow(10,chain-1)*digit*mult));
	var nextCps = Math.max(digit,Math.floor(1/9*Math.pow(10,chain)*digit*mult))/(60*60*6*mult*frenzyMultiplier);
	
	return [moni, nextCps];
}

MS.bankCookieChain = function(frenzyMultiplier)
{
	return (MS.maxCookieChainReward(frenzyMultiplier)[0])*4;
}

MS.coloredCookieChainString = function(numberString, frenzyMultiplier)
{
	var str = '<div class="price\'+(Game.goldenCookie.chain>0 && MS.frenzyMod()=='+frenzyMultiplier+'?\'">\':\' plain">\') + Beautify(' + numberString + ') + \'</div>';
	return str;
}

MS.cookiesToSpend = function(bank)
{
	return Game.cookies - bank;
}

MS.reindeerReward = function(frenzyMultiplier)
{
	var moni=Math.max(25,Game.cookiesPs/MS.frenzyMod()*frenzyMultiplier*60*1);//1 minute of cookie production, or 25 cookies - whichever is highest
	if (Game.Has('Ho ho ho-flavored frosting')) moni*=2;
	if (frenzyMultiplier > 1) moni/=MS.goldenSwitchMod(false);
	
	return moni;
}

MS.maxElderFrenzy = function()
{
	var wrinklersMax = Game.getWrinklersMax();
	var wrinkFactor = wrinklersMax*wrinklersMax*0.05*MS.getSuckFactor();
	wrinkFactor += (1-wrinklersMax*0.05);
	
	var time=Math.ceil(6*Game.goldenCookie.getEffectDurMod());
		
	var moni = Game.cookiesPs / MS.frenzyMod() / MS.goldenSwitchMod(false) * wrinkFactor * 666 * time;
	return moni;
}

MS.neededCookiesForHC = function(HC)
{
	var hcsToAdd = 0;
	
	if (!(HC == null || isNaN(HC) || HC.length==0))
		var hcsToAdd = parseInt(HC);
	
	var hcsOverallNeeded = Game.HowMuchPrestige(Game.cookiesReset) + hcsToAdd;
	return Game.HowManyCookiesReset(hcsOverallNeeded);
}

MS.priceForSacrificeBuildings = function(building, amount)
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

MS.PriceForBuildingAmount = function(inputFieldValue, i)
{
	var building = Game.ObjectsById[i];
	var amount = building.amount+1;
	
	if (!(inputFieldValue == null || isNaN(inputFieldValue) || inputFieldValue.length==0))
		var amount = parseInt(inputFieldValue);
	
	var lowAmount = Math.max(building.amount-building.free, 0);
	var highAmount = Math.max(amount-building.free,0);
	
	var price = building.basePrice*(Math.pow(Game.priceIncrease, highAmount)-Math.pow(Game.priceIncrease, lowAmount))/0.15;
	if (Game.Has('Season savings')) price*=0.99;
	if (Game.Has('Santa\'s dominion')) price*=0.99;
	if (Game.Has('Faberge egg')) price*=0.99;
	if (Game.Has('Divine discount')) price*=0.99;
	if (Game.hasAura('Fierce Hoarder')) price*=0.98;
	
	return Math.ceil(price);
}

MS.storeActiveId = function(str)
{
	var activeid = document.activeElement.id; 
	var curPos=-1;
	var endPos=-1
	if ('selectionStart' in document.activeElement)
	{
		curPos = document.activeElement.selectionStart;
		endPos = document.activeElement.selectionEnd;
	}
	l('menu').innerHTML=str;
	if(Game.onMenu=='stats' && activeid && l(activeid)) 
		l(activeid).focus();
		
	if(curPos>=0)
	{
		l(activeid).selectionStart=curPos;
		l(activeid).selectionEnd=endPos;
	}
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
		return MS.priceForSacrificeBuildings(building, 100);
	}
	else if(Game.dragonLevel == 19 || Game.dragonLevel == 20)
	{
		var price = 0;
		for (var i in Game.ObjectsById)
		{
			price += MS.priceForSacrificeBuildings(Game.ObjectsById[i], (Game.dragonLevel == 19 ? 50 : 200));
		}
		return price;
	}
	else return 0;
}

if(!statsdone)
{
	// How to add a button
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label><br>\'+', 'when out of focus)</label><br>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
	// Replace strings in original Statistics menu
	
	// cookies in bank with wrinklers
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies in bank :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies)+\'</div></div>\'','<b>Cookies in bank (with wrinklers) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies+MS.wrinklersreward())+\'</div></div>\''));
	
	// Cookies per second: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesPs,1)', 'Beautify(Game.cookiesPs/MS.frenzyMod(),1)'));
	// Multiplier: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Math.round(Game.globalCpsMult*100),1)', 'Beautify(Math.round(Game.globalCpsMult*100/MS.frenzyMod()),1)'));

	// cookies baked
	var thisGameEarned = '<b>Cookies baked incl. wrinkl. and ch. egg (this game) :</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedThisGame()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (this ascension) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+\'</div></div>\'', thisGameEarned));	
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
	
	// Lucky (plain, frenzy, dragon) bank + max to spend
	statsString += ' + \'<table style="width: 100%;border-collapse: separate;">\'';
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Lucky</td> <td>Bank</td> <td>Max. Reward</td> <td>Max. Cookies to spend</td> <td>Time Left (with CPS)</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td><div class="price plain">\' + Beautify(MS.bankLucky(1)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxLuckyReward(1)) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(1))) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankLucky(1))) > 0 ? Game.sayTime(time) : "done") + \'</b></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td><div class="price plain">\' + Beautify(MS.bankLucky(7)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxLuckyReward(7)) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(7))) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankLucky(7))) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td><div class="price plain">\' + Beautify(MS.bankLucky(15)) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxLuckyReward(15)) + \'</div></td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(15))) + \'</div></td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForBank(MS.bankLucky(15))) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Cookie Chain stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Cookie Chains</td> <td>Bank</td> <td>Max. Reward</td> <td>Max. Cookies to spend</td> <td>Next CPS</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Clot:</b></td> <td>'+MS.coloredCookieChainString('MS.bankCookieChain(0.5)', 0.5)+'</td> <td>'+MS.coloredCookieChainString('MS.maxCookieChainReward(0.5)[0]', 0.5)+'</td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(0.5))) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(0.5)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td>'+MS.coloredCookieChainString('MS.bankCookieChain(1)', 1)+'</td> <td>'+MS.coloredCookieChainString('MS.maxCookieChainReward(1)[0]', 1)+'</td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(1))) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(1)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td>'+MS.coloredCookieChainString('MS.bankCookieChain(7)', 7)+'</td> <td>'+MS.coloredCookieChainString('MS.maxCookieChainReward(7)[0]', 7)+'</td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(7))) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(7)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td>'+MS.coloredCookieChainString('MS.bankCookieChain(15)', 15)+'</td> <td>'+MS.coloredCookieChainString('MS.maxCookieChainReward(15)[0]',15)+'</td> <td><div class="price plain"> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(15))) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.maxCookieChainReward(15)[1]) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Reindeer stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Reindeers</td> <td>Plain</td> <td>Frenzy</td><td>Dragon Harvest</td><td>Elder Frenzy</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Reindeer reward:</b> </td><td><div class="price plain">\' + Beautify(MS.reindeerReward(1)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(7)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(15)) + \'</div></td><td><div class="price plain">\' + Beautify(MS.reindeerReward(666)) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start Heavenly Chips stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Heavenly Chips</td> <td>Earned (this game)</td> <td>Earned (all time)</td> <td>Wanted (this game)</td> <td>Cookies needed (all time)</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Heavenly Chips:</b> </td><td style="font-weight:bold;">\' + Beautify(MS.hcThisGame()) + \' (\' + Beautify(MS.hcFactor()) + \'%) </td><td style="font-weight: bold;">\' + Beautify(MS.hcAllTime()) + \'</td><td> <input type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" id="tfHC" min=0 max=99999999 style="width:75%;" value=\' + (thisInput=(l("tfHC")==null ? \'0\' : l("tfHC").value)) + \'></input> </td><td class="price plain">\' + Beautify(MS.neededCookiesForHC(thisInput)) + \'</td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	
	// Wrinkler stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Wrinklers</td> <td>Full Elder Frenzy</td> <td>Killing Wrinklers</td> <td>Real Cookies per Hour</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Wrinkler Rewards:</b></td> <td><div class="price plain">\' + Beautify(MS.maxElderFrenzy()) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.wrinklersreward()) + \'</div></td> <td><div class="price plain">\' + Beautify(MS.wrinklersCPH()) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Building stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Buildings</td> <td>Amount wanted</td> <td>Remaining Price</td> <td>Time Left (with wrinklers)</td></tr>\'';
	for (var i in Game.ObjectsById)
	{
		statsString += ' + \'<tr><td class="listing"><b>'+Game.ObjectsById[i].name+':</b></td> <td><input type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" id="tfBuildingAmount'+i+'" min=\'+(minAmount=(Game.ObjectsById['+i+'].amount+1))+\' style="width:20%;" value=\' + (thisInput=(l("tfBuildingAmount'+i+'")==null ? minAmount : Math.max(minAmount,l("tfBuildingAmount'+i+'").value))) + \'></input></td> <td class="price plain">\' + Beautify(price=MS.PriceForBuildingAmount(thisInput, '+i+')) + \'</td> <td style="font-weight:bold;">\' + ((time=MS.timeLeftForCookies(price)) > 0 ? Game.sayTime(time) : "done") + \'</b></td></tr>\'';
	}
	
	// end table
	statsString += ' + \'<table>\'';

	// add blank line
	statsString += ' + \'<br>\'';
	
	// Paste string into the menu
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Game.version+\'</div>\'+', 'Game.version+\'</div>\' + ' + statsString + ' + '));
	
	// Price for next Dragon Level
	var search='\'<div class="listing"><b>Dragon training';
	var replaceDragon='\'<div class="listing"><b>Price for next Dragon Level:</b> <div class="price plain">\' + Beautify(MS.priceForNextDragonLevel()) + \'</div></div>\' + ';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(search, replaceDragon + search));

	
	/********************************************* Change Color of Building prices: **********************************************/
	
	// in this code snippet, the product price is written into the store. Here we set the color.
	var oldProductPriceStr = 'l(\'productPrice\'+me.id).innerHTML=Beautify(Math.round(price));';
	var coloredProductPriceStr = 'MS.refreshBuildingPrice(me)';
	
	// Originally, in each building action the building itself is refreshed. We replace that by refreshing all buildings. 
	// Additionally, the menu is updated (for Amount wanted)
	var thisRefreshStr = 'this.refresh();}';
	var allRefreshStr = 'this.refresh(); MS.calcEfficiencies(); for (var i in Game.ObjectsById) MS.refreshBuildingPrice(Game.ObjectsById[i]); Game.UpdateMenu(); }';

	// Initially, calculate all efficiencies after calling this addon:
	MS.calcEfficiencies()
	
	for (var i in Game.ObjectsById)
	{
		// replace prices by colored prices in function rebuild:
		eval('Game.ObjectsById['+i+'].rebuild='+Game.ObjectsById[i].rebuild.toString().replace(oldProductPriceStr, coloredProductPriceStr));
		
		// replace refreshing of one building by refreshing of all buildings in functions buy(), sell() and sacrifice():
		eval('Game.ObjectsById['+i+'].buy='+Game.ObjectsById[i].buy.toString().replace(thisRefreshStr, allRefreshStr));
		eval('Game.ObjectsById['+i+'].sell='+Game.ObjectsById[i].sell.toString().replace(thisRefreshStr, allRefreshStr));
		eval('Game.ObjectsById['+i+'].sacrifice='+Game.ObjectsById[i].sacrifice.toString().replace(thisRefreshStr, allRefreshStr));
			
		// Additionally, refresh building after calling this addon:
		Game.ObjectsById[i].refresh();
	}
	
	
	// We also refresh the buildings after buying an upgrade:
	var oldActivateUpgrade = 'Game.UpgradesOwned++;';
	var newActivateUpgrade = '{ Game.UpgradesOwned++; } for (var i in Game.ObjectsById) Game.ObjectsById[i].refresh(); ';
	for (var i in Game.UpgradesById)
	{
		eval('Game.UpgradesById['+i+'].buy='+Game.UpgradesById[i].buy.toString().replace(oldActivateUpgrade, newActivateUpgrade));
	}
	
	
	/******************************************************************************************************************************/
	
	// Update Menu after clicking a golden cookie or a reindeer
	eval('Game.goldenCookie.click='+Game.goldenCookie.click.toString().replace(new RegExp(escapeRegExp('Game.Click=0;'),'g'),'Game.Click=0; Game.UpdateMenu();'));
	eval('Game.seasonPopup.click='+Game.seasonPopup.click.toString().replace(new RegExp(escapeRegExp('Game.Click=0;'),'g'),'Game.Click=0; Game.UpdateMenu();'));
	
	// How to append a string to a function
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().slice(0, -1) + 'console.log(\'endUpdateMenu: \' + document.activeElement.id); }');

	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(new RegExp('l\\(\'menu\'\\).innerHTML=str;'), 'MS.storeActiveId(str)'));
	
	// add MSco Stats version to the version label
	l('versionNumber').innerHTML='v. '+Game.version+(Game.beta?' <span style="color:#ff0;">beta</span>':'')+'<br><span style="color:#00ffff; font-size:19px"> MSco Stats v. '+MS.version+'</span>';
	
	// Update the Menu after calling this addon:
	Game.UpdateMenu();
	
	// set statsdone, since the addon may not be called more than once!
	var statsdone = 1;
}
