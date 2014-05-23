/* ================================================
    MSco Cookie Stats - A Cookie Clicker plugin

    Version: 0.9.4
    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  Martin Schober
    Email:   martin.schober@gmx.de

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.

    Features:
	- Show Cookies in bank needed to get the maximum reward of a Frenzy-Lucky-Combo of Golden Cookies
	- Show maximum reward of a Frenzy-Lucky-Combo of Golden Cookies
	- Show maximum of cookies you can spend without getting under the Frenz-Lucky optimized bank
	- Show Cookies you would earn after popping all wrinklers
	- Show Cookies earned per hour with 10 active wrinklers
	- Show Heavenly Chips you would earn additionally after resetting this game
	- Calculate Base Cost per Income (BCI) for each building and show their efficiencies corresponding 
          the best BCI
	- Overloaded sayTime function: Time is displayed a bit more detailed now.

    Version History:

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
Game.ImportSaveCode = function ()
{
    MS.importSaveCodeOrignal();
    MS.importSaveT = Game.T;
    console.log('MS.importSaveT: ' + MS.importSaveT);
}

Game.sayTime=function(time,detail)
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

MS.hcThisGame = function()
{
	return Game.HowMuchPrestige(Game.cookiesEarned+Game.cookiesReset+MS.wrinklersreward()) - Game.prestige['Heavenly chips'];	
}

MS.hcFactor = function()
{
	return Math.round(MS.hcThisGame()/Game.prestige['Heavenly chips'] * 100);	
}

MS.wrinklersreward = function()
{
	var suckFactor = 1.1;
	if (Game.Has('Wrinklerspawn'))
		suckFactor *= 1.05;
	return Game.wrinklers.reduce(function(p,c){return p + suckFactor*c.sucked},0);	
}

MS.wrinklersCPH = function()
{
	var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
	var wrinkFactor = 10*0.5*1.1
	if (Game.Has('Wrinklerspawn'))
		wrinkFactor *= 1.05;
	wrinkFactor += 0.5

	return Game.cookiesPs / frenzyMod * wrinkFactor * 3600;
}

MS.simulateToggle = function(building, buyOrReverse)
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

MS.getBuildingWorth = function(building)
{
	MS.simulateToggle(building, true);
	Game.CalculateGains();

	var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
	var income = Game['cookiesPs']/frenzyMod;

	MS.simulateToggle(building, false);
	Game.CalculateGains();

	return income - Game['cookiesPs']/frenzyMod;
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

MS.bankFrenzyLucky = function()
{
	var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
	return Game.cookiesPs / frenzyMod * 1200 * 10 * 7 + 13;
}

MS.rewardFrenzyLucky = function()
{
        var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
        return Game.cookiesPs / frenzyMod * 1200 * 7 + 13;
}

MS.cookiesToSpend = function()
{
        return Game.cookies - MS.bankFrenzyLucky();
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

	var statsString;

	// Title
	statsString = '\'<br><div class="subsection">\' + \'<div class="title">MSco Stats</div>\'';

	// Frenzy + Lucky bank
	statsString += ' + \'<div class="listing"><b>Bank for Frenzy Lucky:</b> <div class="price plain">\' + Beautify(MS.bankFrenzyLucky()) + \'</div></div>\'';

	// Frenzy + Lucky reward
	statsString += ' + \'<div class="listing"><b>Max. reward of Frenzy Lucky:</b> <div class="price plain">\' + Beautify(MS.rewardFrenzyLucky()) + \'</div></div>\'';

	// Cookies to spend
	statsString += ' + \'<div class="listing"><b>Max. cookies to spend (FL bank):</b> <div class="price plain">\' + Beautify(MS.cookiesToSpend()) + \'</div></div>\'';

	// Rewarded by Wrinklers
	statsString += ' + \'<div class="listing"><b>Cookies Rewarded killing Wrinklers:</b> <div class="price plain">\' + Beautify(MS.wrinklersreward()) + \'</div></div>\'';

	// Real Withered Cookies Per Hour
	statsString += ' + \'<div class="listing"><b>Real Withered Cookies Per Hour:</b> <div class="price plain">\' + Beautify(MS.wrinklersCPH()) + \'</div></div>\'';

	// add blank line
	statsString += ' + \'<br>\'';

	// HCs earned this game
	statsString += ' + \'<div class="listing"><b>HCs earned this game:</b> \' + Beautify(MS.hcThisGame()) + \' (\' + Beautify(MS.hcFactor()) + \'% of current HC) </div>\'';
	
	// add blank line
	statsString += ' + \'<br>\'';

	// BCI
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[0].name + ':</b> \' + Beautify(efc=MS.calcEfficiency(Game.ObjectsById[0], (best_bci=MS.calcBestBCI()))) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[1].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[1], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[2].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[2], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[3].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[3], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[4].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[4], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[5].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[5], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[6].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[6], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[7].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[7], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[8].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[8], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[9].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[9], best_bci)) + \'%\'+ \'</div>\'';
	statsString += ' + \'<div class="listing"><b>BCI ' + Game.ObjectsById[10].name + ':</b> \' + Beautify(MS.calcEfficiency(Game.ObjectsById[10], best_bci)) + \'%\'+ \'</div>\'';

	
	// Paste string into the menu
	eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('Game.version+\'</div>\'+', 'Game.version+\'</div>\' + ' + statsString + ' + '));

	var statsdone = 1;
}
