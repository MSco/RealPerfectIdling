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
MS.Tooltip = {};

MS.version = '1.1.7.3'

// set MS.importSaveDate after importing a save, this is exclusively for another MSco Addon: Real Perfect Idling
MS.importSaveDate = new Date().getTime() - Game.T*1000/Game.fps;
MS.saveImported = false;
MS.pledgeT = 0;
MS.heralds = 0;
// swaps
MS.swaps = 0;
MS.swapT = 0;
// lumps
MS.lumps=0;
MS.lumpsTotal=0;
MS.lumpT=0;
MS.lumpCurrentType=0;

MS.offlineEarned = 0;
MS.RPI_idledone = 0;
//MS.lastLumpsGained = 0
MS.importSaveCodeOrignal = Game.ImportSaveCode;
Game.ImportSaveCode = function(save)
{
    retval = MS.importSaveCodeOrignal(save);
    MS.importSaveDate = new Date().getTime();
    MS.RPI_idledone = 0
    
    if (save && save!='')
    {
    	var str=unescape(save);
    	MS.readPledgeFromStr(str);
    	MS.readHeraldsFromStr(str);
    	MS.readLumpsFromStr(str);
    	MS.readSwapsFromStr(str);
    }
    
    console.log('MS.importSaveDate: ' + MS.importSaveDate);
    return retval;
}

MS.readPledgeFromStr=function(str)
{
	var splitstr=str.split('|');
	var newstr=str
	if (splitstr[0]<1) {}
	else
	{
		newstr=newstr.split('!END!')[0];
		newstr=b64_to_utf8(newstr);
	}
	newstr=newstr.split('|');
	var spl=newstr[4].split(';');
	MS.pledgeT=spl[11]?parseInt(spl[11]):0;
	MS.saveImported = true;
    
	console.log("Save pledgeT:" + Game.sayTime(MS.pledgeT))
}

MS.readHeraldsFromStr=function(str)
{
    var splitstr=str.split('|');
    var newstr=str
    if (splitstr[0]<1) {}
    else
    {
        newstr=newstr.split('!END!')[0];
        newstr=b64_to_utf8(newstr);
    }
    newstr=newstr.split('|');
    var spl=newstr[4].split(';');
    MS.heralds=spl[48]?parseInt(spl[48]):Game.heralds;
    MS.saveImported = true;
    
	console.log("Save heralds:" + MS.heralds)
}

MS.readLumpsFromStr=function(str)
{
	var splitstr=str.split('|');
    var newstr=str
    if (splitstr[0]<1) {}
    else
    {
        newstr=newstr.split('!END!')[0];
        newstr=b64_to_utf8(newstr);
    }
    newstr=newstr.split('|');
    spl=newstr[4].split(';');//cookies and lots of other stuff
	MS.lumps=spl[42]?parseFloat(spl[42]):-1;
	MS.lumpsTotal=spl[43]?parseFloat(spl[43]):-1;
	MS.lumpT=spl[44]?parseInt(spl[44]):Date.now();
	MS.lumpCurrentType=spl[46]?parseInt(spl[46]):0;
	MS.saveImported = true;
	
	console.log("Save lumps:" + MS.lumps)
	console.log("Save lumpsTotal:" + MS.lumpsTotal)
	console.log("Save lumpT:" + new Date(MS.lumpT))
	console.log("Save lumpCurrentType:" + MS.lumpCurrentType)
}

MS.readSwapsFromStr=function(str)
{
	var splitstr=str.split('|');
    var newstr=str
    if (splitstr[0]<1) {}
    else
    {
        newstr=newstr.split('!END!')[0];
        newstr=b64_to_utf8(newstr);
    }
    newstr=newstr.split('|');
	spl=newstr[5].split(';');//buildings
	if (spl[6])
	{
		var mestr=spl[6].toString().split(',');
        spl=mestr[4].split(' ');
        MS.swaps=parseFloat(spl[1]||3);
        MS.swapT=parseFloat(spl[2]||Date.now());
	}
	
	console.log("Swaps:" + MS.swaps)
	console.log("SwapT:" + new Date(MS.swapT))
}

MS.harvestLumps = Game.harvestLumps;
Game.harvestLumps=function(amount,silent)
{
	console.log("-----")
	console.log("Starting harvestLumps on: "+new Date(Date.now()))
	lumpsBefore = Game.lumps;
	console.log("lumpCurrentType before harvest:" + Game.lumpCurrentType)
	MS.harvestLumps(amount,silent);
	console.log("lumps harvested:" + (Game.lumps-lumpsBefore))
	console.log("lumps:" + Game.lumps)
	console.log("lumpT:" + new Date(Game.lumpT))
	console.log("-----")
}

MS.getEffectDurModInWrath=function()
{
    var effectDurMod=1;
    if (Game.Has('Get lucky')) effectDurMod*=2;
    if (Game.Has('Lasting fortune')) effectDurMod*=1.1;
    if (Game.Has('Lucky digit')) effectDurMod*=1.01;
    if (Game.Has('Lucky number')) effectDurMod*=1.01;
    if (Game.Has('Green yeast digestives')) effectDurMod*=1.01;
    if (Game.Has('Lucky payout')) effectDurMod*=1.01;
    //if (Game.hasAura('Epoch Manipulator')) effectDurMod*=1.05;
    effectDurMod*=1+Game.auraMult('Epoch Manipulator')*0.05;
    //if (!me.wrath) effectDurMod*=Game.eff('goldenCookieEffDur');
    /*else*/ 
    effectDurMod*=Game.eff('wrathCookieEffDur');
    return effectDurMod;
}

MS.buildNumberLegend = function(max)
{
	legend_str = ''
	for (var i=3; i<=max; i+=3)
	{
		legend_str += '1e' + i + ' = ' + Beautify(eval('1e'+i)) + '\n'
	}
	legend_str += '"'
	
	return legend_str;
}

Game.sayTime = function(time,detail)
{	
	var str='';
	time=Math.floor(time);

	var seconds = Math.floor(time/Game.fps);
	var minutes = Math.floor(time/(Game.fps*60));
	var hours = Math.floor(time/(Game.fps*60*60));
	var days = Math.floor(time/(Game.fps*60*60*24));
	var years = Math.floor(time/(Game.fps*60*60*24*365));

	var l_seconds, l_minutes, l_hours, l_days;

	var numStrings = 0;

	if (years > 0 && numStrings<2)
	{
		str += years + ' year' + (years!=1 ? 's' : '');
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (days > 0 && numStrings<2)
	{
		var l_days=days-years*365;
		str += l_days + ' day' + (l_days!=1 ? 's' : '');
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (hours > 0 && numStrings<2)
	{
		var l_hours=hours-days*24;
		str += l_hours + ' hour' + (l_hours!=1 ? 's' : '');
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (minutes > 0 && numStrings<2)
	{
		var l_minutes=minutes-hours*60;
		str += l_minutes + ' minute' + (l_minutes!=1 ? 's' : '');
		numStrings++;
		if (numStrings<2)
			str += ', ';
	}
	if (seconds > 0 && numStrings<2)
	{
		var l_seconds=Math.floor(time/Game.fps) - minutes*60;
		str += l_seconds + ' second' + (l_seconds!=1 ? 's' : '');
		numStrings++;
	}

	return str;
}

MS.maxEarnedThisAscension = function()
{
	return (Game.cookiesEarned + MS.wrinklersreward() + MS.chocolateEggMaxReward());
}

MS.maxEarnedAllTime = function()
{
	return (MS.maxEarnedThisAscension() + Game.cookiesReset);
}

MS.Tooltip.hcAllTime = '"The amount of Heavenly Chips before this ascension + the amount of Heavenly Chips you would earn,\n'
		    +'if you switch to the dragon Aura \'Fierce Hoarder\' (if avail.), sell all your buildings and use \'Chocolate egg\' (if avail.)."'
MS.hcAllTime = function()
{
	return Game.HowMuchPrestige(MS.maxEarnedAllTime());	
}

MS.Tooltip.hcThisAscension = '"The amount of Heavenly Chips you would earn, if you switch to the dragon Aura \'Fierce Hoarder\' (if avail.),\n'
			  + 'sell all your buildings and use \'Chocolate egg\' (if avail.). In brackets: The factor of HC earned this ascension and HC earned before this ascension."'
MS.hcThisAscension = function()
{
	return (MS.hcAllTime() - Game.HowMuchPrestige(Game.cookiesReset));	
}

MS.buildingSellReward = function(building)
{
	var buildingamount = building.amount;
	if (building.id == Game.ObjectsN-1 && Game.dragonLevel>=9 && !Game.hasAura('Earth Shatterer'))
		buildingamount--;
	
	var price = Math.ceil(building.basePrice * (Math.pow(Game.priceIncrease, Math.max(0,buildingamount-building.free)+1) - Game.priceIncrease) / 0.15);
	
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
	return Math.round(MS.hcThisAscension()/Game.HowMuchPrestige(Game.cookiesReset) * 100);	
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

MS.Tooltip.wrinklersreward = '"The amount of cookies you will earn after killing all wrinklers."'
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

MS.Tooltip.wrinklersCPH = '"The amount of cookies you will earn, if all wrinklers are active (max. available) and the Golden Switch is on (if avail.)"'
MS.wrinklersCPH = function()
{
	var max = Game.getWrinklersMax();
	var wrinkFactor = max*max*0.05*MS.getSuckFactor();
	wrinkFactor += (1-Game.getWrinklersMax()*0.05)

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
		useSwitchMod = Game.HasUnlocked('Golden switch') && !Game.Has('Golden switch [off]');
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

MS.Tooltip.timeLeftForBank = '"Time left to reach the required bank. Only your current CPS (no wrinklers etc.) is considered."'
MS.timeLeftForBank = function(newbank)
{
	var cookiesLeft = Math.max(0, newbank - Game.cookies);
	var secondsLeft = cookiesLeft/(Game.cookiesPs*(1-Game.cpsSucked)/MS.frenzyMod());
	
	return secondsLeft * Game.fps;
}

MS.Tooltip.timeLeftForCookies = '"Time left until you get the required amount of cookies,\n'
			     + 'if all wrinklers are active (max. available) and the Golden Switch is on (if avail.)"'
MS.timeLeftForCookies = function(cookies)
{
	var cookiesLeft = Math.max(0, cookies - Game.cookies - MS.wrinklersreward());
	var hoursLeft = cookiesLeft/MS.wrinklersCPH();
	
	return hoursLeft * 60 * 60 * Game.fps;
}

MS.Tooltip.estimatedDate = '"The date you will get the required amount of cookies in your bank (including wrinklers),\n'
			     + 'if all wrinklers are active (max. available) and the Golden Switch is on (if avail.)"'
MS.estimatedDate = function(frames)
{
	var estDate = new Date(new Date().getTime()+frames*1000/Game.fps);
	var wdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var h,m;
	var hours = ((h=estDate.getHours()) < 10) ? '0'+h : h;
	var minutes = ((m=estDate.getMinutes()) < 10) ? '0'+m : m;
	return wdays[estDate.getDay()]+", "+estDate.getDate()+"/"+months[estDate.getMonth()] + ", " + hours + ":" + minutes;
}

MS.Tooltip.bankLucky = '"The minimum bank required for the maximum reward of \'Lucky\'."';
MS.bankLucky = function(frenzyMultiplier)
{
	return 1.0/0.15 * Game.cookiesPs / MS.frenzyMod() / MS.goldenSwitchMod(false) * 60 * 15 * frenzyMultiplier;
}

MS.Tooltip.maxLuckyReward = '"The reward of this \'Lucky\' combo if the required bank is available."';
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

MS.Tooltip.bankCookieChain = '"The minimum bank required for the maximum reward of a \'Cookie Chain\'."'
MS.bankCookieChain = function(frenzyMultiplier)
{
	return (MS.maxCookieChainReward(frenzyMultiplier)[0])*4;
}

MS.Tooltip.maxCookieChainReward = '"The maximum reward of the last golden cookie of a  \'Cookie Chain\' if the required bank is available."';
MS.Tooltip.nextCookieChainCPS = '"The base CPS you need to increase the possible max. reward of a \'Cookie Chain\'."';
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

MS.coloredCookieChainString = function(numberString, frenzyMultiplier)
{
	var str = '<div class="price\'+(Game.shimmerTypes.golden.chain>0 && MS.frenzyMod()=='+frenzyMultiplier+'?\'">\':\' plain">\') + Beautify(' + numberString + ') + \'</div>';
	return str;
}

MS.Tooltip.cookiesToSpend = '"The amount of cookies you can spend without falling below the required bank."'
MS.cookiesToSpend = function(bank)
{
	return Game.cookies - bank;
}

MS.Tooltip.reindeerReward = '"The reward for this reindeer combo."'
MS.reindeerReward = function(frenzyMultiplier)
{
	var moni=Math.max(25,Game.cookiesPs/MS.frenzyMod()*frenzyMultiplier*60*1);//1 minute of cookie production, or 25 cookies - whichever is highest
	if (Game.Has('Ho ho ho-flavored frosting')) moni*=2;
	if (frenzyMultiplier > 1) moni/=MS.goldenSwitchMod(false);
	
	return moni;
}

MS.Tooltip.maxElderFrenzy = '"The amount of cookies you will earn by killing all wrinklers, after you get an \'Elder Frenzy\' with the maximum amount of active wrinklers."'
MS.maxElderFrenzy = function()
{
	var wrinklersMax = Game.getWrinklersMax();
	var wrinkFactor = wrinklersMax*wrinklersMax*0.05*MS.getSuckFactor();
	wrinkFactor += (1-wrinklersMax*0.05);
	
	var time=Math.ceil(6*MS.getEffectDurModInWrath());
		
	var moni = Game.cookiesPs / MS.frenzyMod() / MS.goldenSwitchMod(false) * wrinkFactor * 666 * time;
	return moni;
}


MS.Tooltip.HCsWantedThisAscension = '"Enter the amount of Heavenly Chips you want to earn this ascension.\n\n' + MS.buildNumberLegend(21)
MS.Tooltip.neededCookiesForHC = '"The cookies you will have to bake (all time) to earn the desired amount of Heavenly Chips."'
MS.HCsWantedThisAscension = 0;
MS.neededCookiesForHC = function(HC)
{
	var hcsToAdd = 0;
	
	if (!(HC == null || isNaN(HC) || HC.length==0))
		var hcsToAdd = Number(HC);
	
	MS.HCsWantedThisAscension = HC;
	
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

MS.buildingsWanted = []
MS.Tooltip.buildingsWanted = '"Enter the amount of buildings you want to have."'
MS.Tooltip.PriceForBuildingAmount = '"The amount of cookies you will have to spend for buying the remaining amount of buildings."'
MS.PriceForBuildingAmount = function(inputFieldValue, i)
{
	var building = Game.ObjectsById[i];
	var amount = 0;
	
	if (!(inputFieldValue == null || isNaN(inputFieldValue) || inputFieldValue.length==0))
		amount = parseInt(inputFieldValue);
		
	MS.buildingsWanted[i] = amount;
	
	if (amount <= building.amount)
		return 0;
	
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

MS.cookiesWanted = []
MS.Tooltip.cookiesWanted = []
MS.Tooltip.numberLegend = MS.buildNumberLegend(63);

MS.Tooltip.cookiesWanted[0] = '"The amount of cookies you want to have in your bank incl. wrinklers.\n\n' + MS.Tooltip.numberLegend;
MS.Tooltip.cookiesWanted[1] = '"The amount of cookies you want to have baked this game, incl. wrinklers and using\n'
				+'chocolate egg after selling all buildings with dragon aura Earth Shatterer.\n\n' + MS.Tooltip.numberLegend;
MS.Tooltip.cookiesWanted[2] = '"The amount of cookies you want to have baked all time, incl. wrinklers and using\n'
				+'chocolate egg after selling all buildings with dragon aura Earth Shatterer.\n\n' + MS.Tooltip.numberLegend;
MS.Tooltip.cookiesLeftToAmount = '"The remaining amount of cookies to get the wanted amount."'
MS.cookiesLeftToAmount = function(inputFieldValue, i)
{
	var reference;
	
	if (i==0)
		reference = Game.cookies+MS.wrinklersreward();
	else if (i==1)
		reference = MS.maxEarnedThisAscension();
	else if (i==2)
		reference = MS.maxEarnedAllTime();
	
	var target = 0;
	if (!(inputFieldValue == null || isNaN(inputFieldValue) || inputFieldValue.length==0))
		target = Number(inputFieldValue);
	
	if (typeof inputFieldValue == "string")
		MS.cookiesWanted[i] = inputFieldValue;
	var cookiesLeft = Math.max(target - reference, 0);
	var hoursLeft = cookiesLeft/MS.wrinklersCPH();
	var framesLeft = hoursLeft * 60 * 60 * Game.fps;
	
	return [cookiesLeft, framesLeft];
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

MS.grimoire_choices_init = { // 'name of golden cookie buff' : [], max_choices_to_find
		'building special' : [[], 16],
		'click frenzy' : [[], 16],
		'building special + click frenzy' : [[], 8],
		'click frenzy + building special' : [[], 8],
		'building special + building special + click frenzy' : [[], 2],
		'building special + click frenzy + building special' : [[], 2],
		'click frenzy + building special + building special' : [[], 2],
		'free sugar lump' : [[], 2]
	}
MS.grimoire_choices = {}
MS.check_grimoire = function()
{
	if (Object.keys(MS.grimoire_choices).length>0)
		return MS.grimoire_choices
		
	M=Game.ObjectsById[7].minigame
	cg_spellCastTotal = M.spellsCastTotal
	
	MS.grimoire_choices = MS.grimoire_choices_init
	
	found_all = 0
	num_choices = Object.keys(MS.grimoire_choices).length
	
	// [current choice, previous choice, pre-previous choice]
	max_elems = 1
	for (var key in MS.grimoire_choices_init)
		max_elems = Math.max(max_elems, key.split(' + ').length)
		
	choice_array = Array(max_elems).fill("")
	
	while (!(found_all == num_choices))
	{
		spell=M.spells["hand of fate"]
	    var failChance=0.15;
        if (Game.hasBuff('Magic adept')) failChance*=0.1;
        if (Game.hasBuff('Magic inept')) failChance*=5;
	    Math.seedrandom(Game.seed+'/'+cg_spellCastTotal);
	    if (!spell.fail || Math.random()<(1-failChance)) 
		{
			// for math.random: var newShimmer=new Game.shimmer('golden',{noWrath:true});
			x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
			y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
			
			var choices=[];
	        choices.push('frenzy','multiply cookies');
	        if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
	        if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
	        if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
	        //if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
	        if (Math.random()<0.15) choices=['cookie storm drop'];
	        if (Math.random()<0.0001) choices.push('free sugar lump');
	        
	        choice_array[0] = choose(choices)
		} 
		else 
		{
			// for math.random: var newShimmer=new Game.shimmer('golden',{wrath:true});
			x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
			y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
			
			var choices=[];
	        choices.push('clot','ruin cookies');
	        if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
	        if (Math.random()<0.003) choices.push('free sugar lump');
	        if (Math.random()<0.1) choices=['blab'];
	        choice_array[0] = choose(choices)
		}
		
		for (var c in MS.grimoire_choices)
        {
			found = MS.grimoire_choices[c][0].length
			max = MS.grimoire_choices[c][1]
			
			if (found<max)
			{
				spl = c.split(' + ')
				num_elems = spl.length
				
				index = num_elems-1
				combo_found = 1
				for (var i=0; i<num_elems; i++)
				{
					if (choice_array[i] != spl[num_elems-1-i])
					{
						combo_found = 0
						break;
					}
				}
				if (combo_found)
				{
					MS.grimoire_choices[c][0].push(cg_spellCastTotal-index)
	        		if (found+1 == max)
	        			found_all += 1
				}
    		}
		}
		
		for (var i=choice_array.length-1; i>0; i--)
			choice_array[i] = choice_array[i-1]

	    Math.seedrandom();
	    cg_spellCastTotal++;
	}
	
	return MS.grimoire_choices
}

MS.buildGrimoireStrings = function()
{
	function camelize(str) {
	  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word) {
	    return word.toUpperCase();
	  });
	}
	
	statsString = ''
	for (var choice in MS.grimoire_choices_init)
	{
		choice_str = camelize(choice)
		spl = choice_str.split(' + ')
		if (spl.length>1)
		{
			choice_str = choice_str.replaceAll('Building Special', 'B. Spec.')
			choice_str = choice_str.replaceAll('Click Frenzy', 'Click Fr.')
		}
		statsString += ' + \'<tr><td class="listing"><b>'+choice_str+':</b> </td>\''
		col_width = 4
		for (var i=0; i<MS.grimoire_choices_init[choice][1]; i++)
		{
			// beginning of a column
			if (i%col_width==0)
				statsString += ' + \'<td style="font-weight:bold;">\''
				
			statsString += ' + MS.check_grimoire()[\''+choice+'\'][0]['+i+'] + \' \''
			
			// end of a column
			if ((i+1)%col_width==0 || i==MS.grimoire_choices_init[choice][1]-1)
				statsString +='+\'</td>\''
		}
		statsString += '+\'</tr>\''
	}
	
	return statsString;
}

MS.showTimeLeftMagicM = function()
{
	M_grimoire = Game.Objects['Wizard tower'].minigame
	grimoire_draw_orig = M_grimoire.draw
	M_grimoire.draw = function() {
	    grimoire_draw_orig();
	    if (M_grimoire.magic < M_grimoire.magicM && Game.drawT % 5 === 0)
	    {
		    magic = M_grimoire.magic
		    frames = 0
		    while(magic<M_grimoire.magicM) {
		        mps=Math.max(0.002,Math.pow(magic/Math.max(M_grimoire.magicM,100),0.5))*0.002
		        magic += mps
		        frames += 1
		    }
		    frames += Game.fps
		    
		    minutes = Math.floor(frames/Game.fps/60)
		    seconds = Math.floor(frames/Game.fps)%60
		    M_grimoire.magicBarTextL.innerHTML += ' ('+(minutes>0 ? minutes + 'm ' : '') + Math.floor(frames/Game.fps)%60+'s, '+ new Date(Date.now()+frames*1000/Game.fps).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})+')' ;
		 }
	}
}

MS.replaceLumpTooltip = function()
{
	eval('Game.lumpTooltip='+Game.lumpTooltip.toString().replace('"This sugar lump is still growing and will take <b>\%1</b> to reach maturity.",Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1)', '"This sugar lump is still growing and will take <b>\"+Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1)+\" (\"+new Date(Date.now()+(Game.lumpMatureAge-age)).toLocaleTimeString([], {weekday: \'short\', hour: \'2-digit\', minute:\'2-digit\'})+\")</b> to reach maturity."'))
}

function my_onkeydown_handler( event ) {
    switch (event.keyCode) {
        case 116 : // 'F5'
            event.preventDefault();
            event.keyCode = 0;
            window.status = "F5 disabled";
            break;
    }
}



if(!statsdone && Game.sortedMods.length==0)
{
	// Store offline earned amount into a variable (for RPI: to be able to undo offline earned)
	eval('Game.LoadSave='+Game.LoadSave.toString().replace("var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);", "var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100); MS.offlineEarned=amount; "))
	
	// disable F5 if lump type == golden
//	eval('Game.gainLumps='+Game.gainLumps.toString().replace("if (Game.lumpsTotal==-1)","MS.lastLumpsGained=total; if (Game.lumpsTotal==-1)"))
//	eval('Game.computeLumpType='+Game.computeLumpType.toString().replace("Math.seedrandom();", "Math.seedrandom(); if ((MS.lastLumpsGained==7 && Game.lumpCurrentType==1)||Game.lumpCurrentType==2||Game.lumpCurrentType==4) { document.addEventListener(\"keydown\", my_onkeydown_handler);}"));
	
	// How to add a button
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label><br>\'+', 'when out of focus)</label><br>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
	// Grimoire: Show time left to MagicM
	MS.showTimeLeftMagicM();
	
	MS.replaceLumpTooltip();
	
	// Garden: restore nextStep correctly
	eval('Game.Objects.Farm.minigame.load='+Game.Objects.Farm.minigame.load.toString().replace("M.nextStep=parseFloat(spl2[i2++]||M.nextStep);","M.nextStep=parseFloat(spl2[i2++]||M.nextStep);M.nextStep=Date.now()+M.nextStep-Game.lastDate;"));
	eval('Game.Objects.Farm.minigame.load='+Game.Objects.Farm.minigame.load.toString().replaceAll("M.","Game.Objects.Farm.minigame."));
	//eval('Game.Objects.Farm.minigame.load='+Game.Objects.Farm.minigame.load.toString().replace("M.nextStep=parseFloat(spl2[i2++]||M.nextStep);","M.nextStep=parseFloat(spl2[i2++]||M.nextStep);"));
	//console.log(Game.Objects.Farm.minigame.load.toString())
	
	// Replace strings in original Statistics menu
	
	// cookies in bank with wrinklers
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies in bank :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies)+\'</div></div>\'','<b>Cookies in bank (with wrinklers) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookies+MS.wrinklersreward())+\'</div></div>\''));
	
	// Cookies per second: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Game.cookiesPs,1)', 'Beautify(Game.cookiesPs/MS.frenzyMod(),1)'));
	// Multiplier: not effected by any frenzy effects.
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Beautify(Math.round(Game.globalCpsMult*100),1)', 'Beautify(Math.round(Game.globalCpsMult*100/MS.frenzyMod()),1)'));

	// cookies baked
	var thisAscensionEarned = '<b>Cookies baked incl. wrinkl. and ch. egg (this game) :</b> <div class="price plain">\' + Game.tinyCookie() + Beautify(MS.maxEarnedThisAscension()) + \'</div></div>\'';
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('<b>Cookies baked (this ascension) :</b> <div class="price plain">\'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+\'</div></div>\'', thisAscensionEarned));	
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
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td><div class="price plain" title=\'+MS.Tooltip.bankLucky+\'>\' + Beautify(MS.bankLucky(1)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.maxLuckyReward+\'>\' + Beautify(MS.maxLuckyReward(1)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(1))) + \'</div></td> <td style="font-weight:bold;" title=\'+MS.Tooltip.timeLeftForBank+\'>\' + ((time=MS.timeLeftForBank(MS.bankLucky(1))) > 0 ? Game.sayTime(time) : "done") + \'</b></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td><div class="price plain" title=\'+MS.Tooltip.bankLucky+\'>\' + Beautify(MS.bankLucky(7)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.maxLuckyReward+\'>\' + Beautify(MS.maxLuckyReward(7)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(7))) + \'</div></td> <td style="font-weight:bold;" title=\'+MS.Tooltip.timeLeftForBank+\'>\' + ((time=MS.timeLeftForBank(MS.bankLucky(7))) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td><div class="price plain" title=\'+MS.Tooltip.bankLucky+\'>\' + Beautify(MS.bankLucky(15)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.maxLuckyReward+\'>\' + Beautify(MS.maxLuckyReward(15)) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankLucky(15))) + \'</div></td> <td style="font-weight:bold;" title=\'+MS.Tooltip.timeLeftForBank+\'>\' + ((time=MS.timeLeftForBank(MS.bankLucky(15))) > 0 ? Game.sayTime(time) : "done") + \' </td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Cookie Chain stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Cookie Chains</td> <td>Bank</td> <td>Max. Reward</td> <td>Max. Cookies to spend</td> <td>Next CPS</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Clot:</b></td> <td title=\'+MS.Tooltip.bankCookieChain+\'>'+MS.coloredCookieChainString('MS.bankCookieChain(0.5)', 0.5)+'</td> <td title=\'+MS.Tooltip.maxCookieChainReward+\'>'+MS.coloredCookieChainString('MS.maxCookieChainReward(0.5)[0]', 0.5)+'</td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(0.5))) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.nextCookieChainCPS+\'>\' + Beautify(MS.maxCookieChainReward(0.5)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Plain:</b></td> <td title=\'+MS.Tooltip.bankCookieChain+\'>'+MS.coloredCookieChainString('MS.bankCookieChain(1)', 1)+'</td> <td title=\'+MS.Tooltip.maxCookieChainReward+\'>'+MS.coloredCookieChainString('MS.maxCookieChainReward(1)[0]', 1)+'</td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(1))) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.nextCookieChainCPS+\'>\' + Beautify(MS.maxCookieChainReward(1)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Frenzy:</b></td> <td title=\'+MS.Tooltip.bankCookieChain+\'>'+MS.coloredCookieChainString('MS.bankCookieChain(7)', 7)+'</td> <td title=\'+MS.Tooltip.maxCookieChainReward+\'>'+MS.coloredCookieChainString('MS.maxCookieChainReward(7)[0]', 7)+'</td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(7))) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.nextCookieChainCPS+\'>\' + Beautify(MS.maxCookieChainReward(7)[1]) + \'</div></td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Dragon Harvest:</b></td> <td title=\'+MS.Tooltip.bankCookieChain+\'>'+MS.coloredCookieChainString('MS.bankCookieChain(15)', 15)+'</td> <td title=\'+MS.Tooltip.maxCookieChainReward+\'>'+MS.coloredCookieChainString('MS.maxCookieChainReward(15)[0]',15)+'</td> <td><div class="price plain" title=\'+MS.Tooltip.cookiesToSpend+\'> \' + Beautify(MS.cookiesToSpend(MS.bankCookieChain(15))) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.nextCookieChainCPS+\'>\' + Beautify(MS.maxCookieChainReward(15)[1]) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Reindeer stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Reindeers</td> <td>Plain</td> <td>Frenzy</td><td>Dragon Harvest</td><td>Elder Frenzy</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Reindeer reward:</b> </td><td><div class="price plain" title=\'+MS.Tooltip.reindeerReward+\'>\' + Beautify(MS.reindeerReward(1)) + \'</div></td><td><div class="price plain" title=\'+MS.Tooltip.reindeerReward+\'>\' + Beautify(MS.reindeerReward(7)) + \'</div></td><td><div class="price plain" title=\'+MS.Tooltip.reindeerReward+\'>\' + Beautify(MS.reindeerReward(15)) + \'</div></td><td><div class="price plain" title=\'+MS.Tooltip.reindeerReward+\'>\' + Beautify(MS.reindeerReward(666)) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// start Heavenly Chips stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Heavenly Chips</td> <td>Earned (this game)</td> <td>Earned (all time)</td> <td>Wanted (this game)</td> <td>Cookies needed (all time)</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Heavenly Chips:</b> </td><td style="font-weight:bold;" title=\'+MS.Tooltip.hcThisAscension+\'>\' + Beautify(MS.hcThisAscension()) + \' (\' + Beautify(MS.hcFactor()) + \'%) </td><td style="font-weight: bold;" title=\'+MS.Tooltip.hcAllTime+\'>\' + Beautify(MS.hcAllTime()) + \'</td><td> <input type="text" title=\'+MS.Tooltip.HCsWantedThisAscension+\' onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 101 || event.charCode == 69 || event.charCode == 46" id="tfHC" min=0 max=99999999 style="width:75%;" value=\' + (thisInput=(l("tfHC")==null ? MS.HCsWantedThisAscension : l("tfHC").value)) + \'></input> </td><td class="price plain" title=\'+MS.Tooltip.neededCookiesForHC+\'>\' + Beautify(MS.neededCookiesForHC(thisInput)) + \'</td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Wrinkler stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Wrinklers</td> <td>Full Elder Frenzy</td> <td>Killing Wrinklers</td> <td>Real Cookies per Hour</td></tr>\'';
	statsString += ' + \'<tr><td class="listing"><b>Wrinkler Rewards:</b></td> <td><div class="price plain" title=\'+MS.Tooltip.maxElderFrenzy+\'>\' + Beautify(MS.maxElderFrenzy()) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.wrinklersreward+\'>\' + Beautify(MS.wrinklersreward()) + \'</div></td> <td><div class="price plain" title=\'+MS.Tooltip.wrinklersCPH+\'>\' + Beautify(MS.wrinklersCPH()) + \'</div></td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Grimoire stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Grimoire</td></tr>\'';
	statsString += MS.buildGrimoireStrings()
//	"<td style="font-weight:bold;">\' + MS.check_grimoire()[\'click frenzy\'][0][0] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][1] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][2] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][3] + \'</td><td style="font-weight:bold;">\' + MS.check_grimoire()[\'click frenzy\'][0][4] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][5] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][6] + \' \' + MS.check_grimoire()[\'click frenzy\'][0][7] + \'</td></tr>\'';
//	statsString += ' + \'<tr><td class="listing"><b>Next Building Special:</b> </td><td style="font-weight:bold;">\' + MS.check_grimoire()[\'building special\'][0][0] + \' \' + MS.check_grimoire()[\'building special\'][0][1] + \' \' + MS.check_grimoire()[\'building special\'][0][2] + \' \' + MS.check_grimoire()[\'building special\'][0][3] + \'</td><td style="font-weight:bold;">\' + MS.check_grimoire()[\'building special\'][0][4] + \' \' + MS.check_grimoire()[\'building special\'][0][5] + \' \' + MS.check_grimoire()[\'building special\'][0][6] + \' \' + MS.check_grimoire()[\'building special\'][0][7] + \'</td></tr>\'';
//	statsString += ' + \'<tr><td class="listing"><b>Next Free Sugar Lump:</b> </td><td style="font-weight:bold;">\' + MS.check_grimoire()[\'free sugar lump\'][0][0] + \' \' + MS.check_grimoire()[\'free sugar lump\'][0][1]+ \'</td></tr>\'';
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Building stats
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Buildings</td> <td>Amount wanted</td> <td>Remaining Price</td> <td>Time Left (with wrinklers)</td> <td>Estimated date</td></tr>\'';
	for (var i in Game.ObjectsById)
	{
		MS.buildingsWanted[i]=0;
		statsString += ' + \'<tr><td class="listing"><b>'+Game.ObjectsById[i].name+':</b></td> <td><input type="text" title=\'+MS.Tooltip.buildingsWanted+\' onkeypress="return event.charCode >= 48 && event.charCode <= 57" id="tfBuildingAmount'+i+'" min=0 style="width:20%;" value=\' + (thisInput=(l("tfBuildingAmount'+i+'")==null ? MS.buildingsWanted['+i+'] : l("tfBuildingAmount'+i+'").value)) + \'></input></td> <td class="price plain" title=\'+MS.Tooltip.PriceForBuildingAmount+\'>\' + Beautify(price=MS.PriceForBuildingAmount(thisInput, '+i+')) + \'</td> <td style="font-weight:bold;" title=\'+MS.Tooltip.timeLeftForCookies+\'>\' + ((time=MS.cookiesLeftToAmount(price, 0)[1]) > 0 ? Game.sayTime(time) : "done") + \'</b></td> <td style="font-weight:bold;" title=\'+MS.Tooltip.estimatedDate+\'>\' + ((time > 0) ? MS.estimatedDate(time) : "done") + \'</b></td></tr>\'';
	}
	
	// add blank row
	statsString += ' + \'<tr style="height: 20px;"><td colspan="4"></td></tr>\'';
	
	// Cookies wanted
	statsString += ' + \'<tr class="title" style="font-size:15px;"><td class="listing" style="font-size:20px;">Cookies</td> <td>Amount wanted</td> <td>Remaining</td> <td>Time Left (with wrinklers)</td> <td>Estimated date</td></tr>\'';
	var cookieStrings = ['Bank (with wrinklers):', 'This Game:', 'All Time:'];
	for (var i=0; i<=2; i++)
	{
		MS.cookiesWanted[i]=0;
		statsString += ' + \'<tr><td class="listing"><b>'+cookieStrings[i]+'</b></td> <td><input type="text" title=\'+MS.Tooltip.cookiesWanted['+i+']+\' onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 101 || event.charCode == 69 || event.charCode == 46" id="tfCookieAmount'+i+'" min=0 style="width:50%;" value=\' + (thisInput=(l("tfCookieAmount'+i+'")==null ? MS.cookiesWanted['+i+'] : l("tfCookieAmount'+i+'").value)) + \'></input></td> <td class="price plain" title=\'+MS.Tooltip.cookiesLeftToAmount+\'>\' + Beautify(price=MS.cookiesLeftToAmount(thisInput, '+i+')[0]) + \'</td> <td style="font-weight:bold;" title=\'+MS.Tooltip.timeLeftForCookies+\'>\' + ((time=MS.cookiesLeftToAmount(thisInput, '+i+')[1]) > 0 ? Game.sayTime(time) : "done") + \'</b></td> <td style="font-weight:bold;" title=\'+MS.Tooltip.estimatedDate+\'>\' + ((time > 0) ? MS.estimatedDate(time) : "done") + \'</b></td></tr>\'';
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
	
	
//	// Show Current Lump Type
//	lumpTypeList = ['Normal', 'Bifurcated', 'Golden', 'Meaty', 'Caramelized']
//	lumpTypeColorList = ['#ffffff', '#60ff50', '#ffcc2f', '#FF7F00', '#FF00FF']
//	eval('Game.doLumps='+Game.doLumps.toString().replace("l('lumpsAmount').textContent=Beautify(Game.lumps);", "l('lumpsAmount').textContent=Beautify(Game.lumps) + \" \"+ lumpTypeList[Game.lumpCurrentType]; l('lumpsAmount').style.color=lumpTypeColorList[Game.lumpCurrentType]")) 
	
	/******************************************************************************************************************************/
	
	// Update Menu after cookie chain:
	eval('Game.shimmerTypes.golden.popFunc='+Game.shimmerTypes.golden.popFunc.toString().replace('this.chain++;', 'this.chain++; Game.UpdateMenu();'));

	// How to append a string to a function
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().slice(0, -1) + 'console.log(\'endUpdateMenu: \' + document.activeElement.id); }');

	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(new RegExp('l\\(\'menu\'\\).innerHTML=str;'), 'MS.storeActiveId(str)'));
	
	// add MSco Stats version to the version label
	l('versionNumber').innerHTML='v. '+Game.version+(Game.beta?' <span style="color:#ff0;">beta</span>':'')+'<br><span style="color:#00ffff; font-size:19px"> MSco Stats v. '+MS.version+'</span>';
	
	// Update the Menu after calling this addon:
	Game.UpdateMenu();
	
	// reset grimoire stats after cast spell
	castSpellOrig = Game.ObjectsById[7].minigame.castSpell;
	Game.ObjectsById[7].minigame.castSpell = function(spell,obj)
	{
		retval = castSpellOrig(spell,obj);
	 	MS.grimoire_choices = {};
	 	return retval;
	} 
	
	// reset grimoire stats after ascend intro
	updateAscendIntroOrig = Game.UpdateAscendIntro;
	Game.UpdateAscendIntro = function() { updateAscendIntroOrig(); MS.grimoire_choices = {}}
	
	// set statsdone, since the addon may not be called more than once!
	var statsdone = 1;
}
