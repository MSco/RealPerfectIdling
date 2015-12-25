/* ================================================
    MSco Perfect Idling With Wrinklers - A Cookie Clicker plugin

    Version: 0.9.8.6
    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  Martin Schober
    Email:   martin.schober@gmx.de

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.

    This add-on simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
    between now and the last time the game was saved. Each feature listed below is simulated exactly like in
    the original game.

    Following calculations are done "while game is closed":
	- Wrinklers spawn if elder wrath is active as in the original game with all Math.random() stuff etc. ...
	- Wrinklers suck cookies (also increasing Game.cookiesSucked)
	- CPS is reduced while wrinklers suck the big cookie
	- Elder wrath increases
	- Season timer decreases
	- Research timer decreases
	- Cookies are earned from global cps (concerning the reduced cps because of wrinklers)
	- Add missed Golden Cookies
	- Recalculate CPS regarding 'Century egg' from easter update. CPS of last save and current CPS are averaged for this.

    Version History:
    0.9.8:
    	- Beta 1.9 support
    0.9.7:
    	- Beta 1.0501 support
    0.9.6:
    	- Century egg calculation averaged by a specific number of intervals
    0.9.5:
    	- Substract saveImportT from Game.T, saveImportT is messured by MScoStats
    	- Increase variable Game.cookiesSucked
    0.9.4:
    	- Show message if Game.version is not supported
    	- Subtract Game.T (time after last reload) from afk time
    0.9.3:
	- Implemented more methods to split up main code
	- Own method to generae time string
    0.9.2:
	- New calculation of average Golden Cookie spawn time, used for missedGoldenCookies
	- Output of 'Missed Golden Cookies while afk' in console.
    0.9.1:
	- New calculation of cps boost of 'Century egg' as in v1.0465
    0.9.0:
	- recalculate CPS regarding 'Century egg'
    0.8.0:
	- Recalculate pledge timer
	- Activate elder wrath after pledge
	- Earn cookies during pledge
    0.7.2:
	- Recalculate research timer
    0.7.1:
	- Add missed Golden Cookies
    0.7.0:
	- Initial Version with first features:
		- wrinklers spawn
		- wrinklers suck
		- reduce cps
		- increase elder wrath
		- decrease season duration
		- earn cookies


/*** notes for century egg cps calculation ******/
/*
var lastDay=5*24*60*60;
var day=10*24*60*60;


var integ=0;
for (var i=lastDay; i<=day;i++)
{
    integ+=(1-Math.pow(1-i/100,3))*10;
}

var integ2=0;
for (var i=lastDay; i<=day;i++)
{
    integ2+=(1-Math.pow(1-i/100,3))*10;
    if (integ2>=integ/2)
    {
        var halfday=i;
        break;
    }
}
halfday/60/60/24;
*/
/******************************************************/

/*================================================ */

var RPI = {};

RPI.importSaveT = 0;
if (MS)
{
	RPI.importSaveT = MS.importSaveT;
	console.log('RPI.importSaveT: ' + RPI.importSaveT);
}

RPI.supportedVersion = 1.9
if (RPI.supportedVersion < Game.version)
{
	Game.Notify('Unsupported version','MSco\'s Real Perfect Idling has not been tested on this version of Cookie Clicker. Continue on your own peril!',[3,5],6);
}

RPI.calcGCSpawnTime = function()
{
	var min=Game.goldenCookie.getMinTime();
	var max=Game.goldenCookie.getMaxTime();
	var probabilityNoGC=1;
	for (t=min; t<=max; t++)
	{
		probabilityNoGC *= (1-Math.pow((t-min)/(max-min),5))
		if ((1-probabilityNoGC) >= 0.5)
			return t;
	}    

	return max;
}

RPI.addMissedGoldenCookies = function(durationFrames)
{
	if (!Game.Has('Golden switch [off]'))
	{
		var dur=13*Game.fps;	// how long will it stay on-screen?
	        if (Game.Has('Lucky day')) dur*=2;
	        if (Game.Has('Serendipity')) dur*=2;
		if (Game.Has('Decisive fate')) dur*=1.05;
		if (Game.version >= 1.9)
			if (Game.hasAura('Epoch Manipulator')) dur*=1.05;
	        
		var thisMissed = Math.round(durationFrames/(RPI.calcGCSpawnTime()+dur))
		Game.missedGoldenClicks += thisMissed;
		console.log('Missed Golden Cookies while afk: ' + thisMissed);
	}
}

RPI.calcCpsCenturyEgg = function()
{
	if (Game.Has('Century egg'))
	{
		var currentEggMult=0;
		if (Game.Has('Chicken egg')) currentEggMult++;
		if (Game.Has('Duck egg')) currentEggMult++;
		if (Game.Has('Turkey egg')) currentEggMult++;
		if (Game.Has('Quail egg')) currentEggMult++;
		if (Game.Has('Robin egg')) currentEggMult++;
		if (Game.Has('Ostrich egg')) currentEggMult++;
		if (Game.Has('Cassowary egg')) currentEggMult++;
		if (Game.Has('Salmon roe')) currentEggMult++;
		if (Game.Has('Frogspawn')) currentEggMult++;
		if (Game.Has('Shark egg')) currentEggMult++;
		if (Game.Has('Turtle egg')) currentEggMult++;
		if (Game.Has('Ant larva')) currentEggMult++;
		var oldEggMult = currentEggMult;
		var averageEggMult = currentEggMult;

		//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
		var todayDays=Math.floor((new Date().getTime()/*-(Game.T-RPI.importSaveT)/Game.fps*1000*/-Game.startDate)/1000/10)*10/60/60/24;
		todayDays=Math.min(todayDays,100);
		var currentCenturyBonus = (1-Math.pow(1-todayDays/100,3))*10
		currentEggMult += currentCenturyBonus;

		var lastDateDays=Math.floor((Game.lastDate-Game.startDate)/1000/10)*10/60/60/24;
		lastDateDays=Math.min(lastDateDays,100);
		var oldCenturyBonus = (1-Math.pow(1-lastDateDays/100,3))*10
		oldEggMult += oldCenturyBonus;

		var baseCps = Game.cookiesPs / (1+0.01*currentEggMult);
		var oldCps = baseCps * (1+0.01*oldEggMult);
		//var averageCps = (Game.cookiesPs + oldCps)/2;
		
		/*******************/
		// Calculation of century egg bonus averaging over a specific number of intervals
		var numIntervals = 100;
		var intLength = (todayDays-lastDateDays)/numIntervals;
		var averageCenturyBonus = 0;
		for (var i=0; i<=numIntervals;++i)
		{
			var itDays = lastDateDays + i*intLength;
			var itCenturyBonus = (1-Math.pow(1-itDays/100,3))*10;
			averageCenturyBonus += itCenturyBonus;
		}
		averageCenturyBonus /= (numIntervals+1);
		averageEggMult += averageCenturyBonus;
		var averageCps = baseCps * (1+0.01*averageEggMult);
		/*******************/
		
		
		/*******************/
		// Calculation of integrals: We use that day, 
		// when the integral between lastDay and day reached its half
		/*
		var lastDayInMins=lastDay*24*60;
		var dayInMins=day*24*60;
		
		
		var integFull=0;
		for (var i=lastDayInMins; i<=dayInMins;i++)
		{
		    integFull+=(1-Math.pow(1-i/100,3))*10;
		}
		
		var integHalf=0;
		for (var i=lastDayInMins; i<=dayInMins;i++)
		{
		    integHalf+=(1-Math.pow(1-i/100,3))*10;
		    if (integHalf>=integFull/2)
		    {
		        var halfday=i;
		        break;
		    }
		}
		halfday = halfday/60/24;
		var averageCenturyBonus = (1-Math.pow(1-halfday/100,3))*10;
		averageEggMult += averageCenturyBonus;
		var averageCpsNew = baseCps * (1+0.01*averageEggMult)
		*/
		/*******************/

		console.log('CPS without century egg: ' + Beautify(baseCps * (1+0.01*(currentEggMult-currentCenturyBonus))));
		console.log('CPS when game was saved: ' + Beautify(oldCps));
		console.log('Average CPS over ' + numIntervals + ' intervals: ' + Beautify(averageCps));
		//console.log('CPS with half integral century bonus: ' + Beautify(averageCpsNew))
		console.log('Current CPS: ' + Beautify(Game.cookiesPs))
		return averageCps;
		//return averageCpsNew;
	}
	else
	{
		return Game.cookiesPs;
	}
}

RPI.addTotalCookies = function(cps, durationSeconds)
{
	var factor = cps / Game.cookiesPs;
	for (var i in Game.Objects)
	{
		var me=Game.Objects[i];
		me.totalCookies+=(me.storedTotalCps*factor*Game.globalCpsMult) * durationSeconds;
	}
}

RPI.runElderPledge = function(cps, durationSeconds)
{
	if(Game.Has('Elder Pledge'))
	{
		var secondsRemaining = Math.max(durationSeconds - Game.pledgeT/Game.fps, 0);
		var pledgeSeconds = durationSeconds - secondsRemaining;
		var pledgeEarned = pledgeSeconds*cps;
		Game.Earn(pledgeEarned);

		Game.pledgeT = Math.max(Game.pledgeT - pledgeSeconds*Game.fps, 0);
		if (Game.pledgeT == 0)
		{
			Game.Lock('Elder Pledge');
			Game.Unlock('Elder Pledge');
			Game.elderWrath = 1;
		}
		console.log('Cookies earned from pledge: ' + Beautify(pledgeEarned));

		return [pledgeEarned, secondsRemaining];
	}
	else
	{
		return [0, durationSeconds];
	}
}

RPI.runWrath = function(cps, durationSeconds)
{
	if (Game.elderWrath>0)
	{
		// how much frames will be simulated?
		var durationFrames = durationSeconds * Game.fps;

		// initialize values
		var cookiesSuckedWrath=0;
		var cookiesEarnedWrath=0;
		var frames=0;
		var numWrinklers=0;

		// check spawned wrinklers
		for (var i in Game.wrinklers)
		{	
			if(Game.wrinklers[i].phase>0)
			{
				numWrinklers++;
			}
		}

		// spawn remaining wrinklers
		while(numWrinklers<MS.wrinklersMax() && frames<durationFrames)
		{
			// increase elder wrath
			var potentialWrath = Game.Has('One mind')+Game.Has('Communal brainsweep')+Game.Has('Elder Pact');
			if (Math.random()<0.001 && Game.elderWrath<potentialWrath)
			{
				Game.elderWrath++;
				console.log("Time for elder wrath " + Game.elderWrath + ": " + frames/Game.fps + " seconds");
			}
	
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase==0 && Game.elderWrath>0 && numWrinklers<MS.wrinklersMax())
				{
					var chance = (Game.version >= 1.9) ? 0.00001*Game.elderWrath : 0.00003*Game.elderWrath;
					if (Game.Has('Unholy bait')) chance*=5;
					if (Game.Has('Wrinkler doormat')) chance=0.1;
					if (Math.random()<chance) 
					{
						Game.wrinklers[i].phase=2;
						Game.wrinklers[i].hp=Game.wrinklerHP;
						if (Game.version >= 1.9)
						{
							Game.wrinklers[i].type=0;
							if (Math.random()<0.001) 
								Game.wrinklers[i].type=1; // shiny wrinkler
						}
						numWrinklers++;
						console.log("Time to spawn wrinkler " + i + ": " + frames/Game.fps/60 + " minutes. ")
					}//respawn
				}
				
				// set cps
				var suckedFactor = numWrinklers*0.05;
				var remainingCps = cps * (1-suckedFactor);
	
				if (Game.wrinklers[i].phase == 2)
				{
					var thisSuck = (cps/Game.fps)*suckedFactor;
					Game.wrinklers[i].sucked += thisSuck;
					cookiesSuckedWrath += thisSuck;
				}
			}
		
			var thisEarned = remainingCps/Game.fps;
			Game.Earn(thisEarned);
			Game.cookiesSucked += ((cps/Game.fps)*suckedFactor);
			cookiesEarnedWrath += thisEarned;
			frames++;
		}

		var spawnTime = frames/Game.fps;

		if (numWrinklers >= MS.wrinklersMax())
		{
			var fullWitheredTime = durationSeconds-spawnTime;
			var witherFactor = numWrinklers * 0.05;
			var unwitheredCps = cps * (1-witherFactor);
			
			var thisSuck = cps*witherFactor*fullWitheredTime;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase==2)
				{
					Game.wrinklers[i].sucked+=thisSuck;
					cookiesSuckedWrath += thisSuck;
				}
			}

	
			var thisEarned = unwitheredCps*fullWitheredTime;
			Game.Earn(thisEarned);
			Game.cookiesSucked += thisSuck;
			cookiesEarnedWrath += thisEarned;
		}

		return [cookiesEarnedWrath, cookiesSuckedWrath];
	}
	else
	{
		var thisEarned = cps*durationSeconds;
		Game.Earn(thisEarned);

		return [thisEarned, 0];
	}
}

RPI.undoOfflineEarned = function(durationSeconds)
{
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
		
		//var timeOffline=(new Date().getTime()-Game.lastDate)/1000;
		var timeOffline=durationSeconds
		var timeOfflineOptimal=Math.min(timeOffline,maxTime);
		var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
		var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);
		
		if (amount>0)
		{
			if (Game.prefs.popups) Game.Popup('Eliminated '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s'));
			else Game.Notify('Welcome back!','Eliminated <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s'));
			Game.Earn(-amount);
			console.log('Cookies eliminated: ' + Beautify(amount));
		}
	}
}

RPI.framesToString = function(time)
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

if (!idleDone)
{
	// how to add button:
	//eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label></div>\'+', 'when out of focus)</label></div>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
	var secondsAfk = (new Date().getTime()-Game.lastDate)/1000 - (Game.T-RPI.importSaveT)/Game.fps;
	//var secondsAfk = 50*60; 					// for debug
	var framesAfk = (new Date().getTime()-Game.lastDate)/1000*Game.fps - (Game.T-RPI.importSaveT);
	console.log('AFK: ' + RPI.framesToString(framesAfk));

	// initialize global values
	var cookiesEarned = 0;
	var cookiesSucked = 0;

	// calculate cps regarding century egg
	var averageCps = RPI.calcCpsCenturyEgg();

	// calculate cookies earned during pledge
	var cookiesAndTime = RPI.runElderPledge(averageCps, secondsAfk);
	cookiesEarned += cookiesAndTime[0];
	var secondsRemaining = cookiesAndTime[1];
	
	// calculate cookies earned and sucked during elder wrath
	var earnedAndSucked = RPI.runWrath(averageCps, secondsRemaining);
	cookiesEarned += earnedAndSucked[0];
	cookiesSucked += earnedAndSucked[1];
	
	RPI.undoOfflineEarned(secondsAfk);
	
	RPI.addTotalCookies(averageCps, secondsAfk);
	
	// recalculate timers of the current season and current research
	if (Game.seasonT > 0)
		Game.seasonT = Math.max(Game.seasonT-secondsAfk*Game.fps, 0);
	if (Game.researchT > 0)
		Game.researchT = Math.max(Game.researchT -secondsAfk*Game.fps, 0);

	// add missed golden cookies
	RPI.addMissedGoldenCookies(framesAfk);

	// Output of cookies earned and sucked
	if (Game.prefs.popups)
	{
		Game.Popup('Cookies sucked while afk: ' + Beautify(cookiesSucked)+' cookies!');
		Game.Popup('Earned '+Beautify(cookiesEarned)+' cookie'+(Math.floor(cookiesEarned)==1?'':'s')+' while you were away');
	}
	else 
	{
		Game.Notify('AFK: ' + RPI.framesToString(framesAfk),'Wrinklers sucked <b>'+Beautify(cookiesSucked)+'</b> cookies while you were away.',[19,8],6);
		Game.Notify('AFK: ' + RPI.framesToString(framesAfk),'You earned <b>'+Beautify(cookiesEarned)+'</b> cookie'+(Math.floor(cookiesEarned)==1?'':'s')+' while you were away.',[10,0],6);
	}

	console.log('Cookies earned while afk: ' + Beautify(cookiesEarned));
	console.log('Cookies sucked while afk: ' + Beautify(cookiesSucked));

	var idleDone=1;
}
else
{
	if (Game.prefs.popups)
		Game.Popup('Nothing done! You already used this addon after loading! Do not use it to cheat! :)');
	else
		Game.Notify('Nothing done!','You already used this addon after loading! Do not use it to cheat! :)',[3,5],6);
}
