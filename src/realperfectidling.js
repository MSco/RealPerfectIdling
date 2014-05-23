/* ================================================
    MSco Perfect Idling With Wrinklers - A Cookie Clicker plugin

    Version: 0.9.5
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
	- Wrinklers suck cookies
	- CPS is reduced while wrinklers suck the big cookie
	- Elder wrath increases
	- Season timer decreases
	- Research timer decreases
	- Cookies are earned from global cps (concerning the reduced cps because of wrinklers)
	- Add missed Golden Cookies
	- Recalculate CPS regarding 'Century egg' from easter update. CPS of last save and current CPS are averaged for this.

    Version History:
    0.9.5:
    	- Game.T is not regarded anymore because Game.T contains also the time between loading the game 
    	and importing the save.
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

RPI.supportedVersion = "1.0465"
if (RPI.supportedVersion != Game.version)
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
	var dur=13*Game.fps;	// how long will it stay on-screen?
        if (Game.Has('Lucky day')) dur*=2;
        if (Game.Has('Serendipity')) dur*=2;
	var thisMissed = Math.round(durationFrames/(RPI.calcGCSpawnTime()+dur))
	Game.missedGoldenClicks += thisMissed;
	console.log('Missed Golden Cookies while afk: ' + thisMissed);
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
		var day=Math.floor((new Date().getTime()/*-Game.T/Game.fps*1000*/-Game.startDate)/1000/10)*10/60/60/24;
		day=Math.min(day,100);
		var currentCenturyBonus = (1-Math.pow(1-day/100,3))*10
		currentEggMult += currentCenturyBonus;

		var lastDay=Math.floor((Game.lastDate-Game.startDate)/1000/10)*10/60/60/24;
		lastDay=Math.min(lastDay,100);
		var oldCenturyBonus = (1-Math.pow(1-lastDay/100,3))*10
		oldEggMult += oldCenturyBonus;

		var baseCps = Game.cookiesPs / (1+0.01*currentEggMult);
		var oldCps = baseCps * (1+0.01*oldEggMult);
		var averageCps = (Game.cookiesPs + oldCps)/2;

		
		
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

		console.log('CPS when game was saved: ' + Beautify(oldCps));
		console.log('Average CPS: ' + (averageCps));
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
		var wrinklerSpawnTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		// check spawned wrinklers
		for (var i in Game.wrinklers)
		{	
			if(Game.wrinklers[i].phase>0)
			{
				wrinklerSpawnTimes[i] = 0;
				numWrinklers++;
			}
		}

		// spawn remaining wrinklers
		while(numWrinklers<10 && frames<durationFrames)
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
				if ( (Game.wrinklers[i].phase==0) && (Math.random() < 0.00003*Game.elderWrath) )
				{
					wrinklerSpawnTimes[i] = frames/Game.fps;
					Game.wrinklers[i].phase = 2;
					Game.wrinklers[i].hp = 3;
					numWrinklers++;
					console.log("Time to spawn wrinkler " + i + ": " + wrinklerSpawnTimes[i]/60 + " minutes. ")
				}

				// set cps
				var suckedFactor = numWrinklers*0.05;
				var remainingCps = cps * (1-numWrinklers*0.05);
	
				if (Game.wrinklers[i].phase == 2)
				{
					var thisSuck = (cps/Game.fps)*suckedFactor;
					Game.wrinklers[i].sucked += thisSuck;
					cookiesSuckedWrath += thisSuck;
				}
			}
		
			var thisEarned = remainingCps/Game.fps;
			Game.Earn(thisEarned);
			cookiesEarnedWrath += thisEarned;
			frames++;
		}

		var spawnTime = frames/Game.fps;

		if (numWrinklers == 10)
		{
			var fullWitheredTime = durationSeconds-spawnTime;
			var unwitheredCps = cps * 0.5;
	
			for (var i in Game.wrinklers)
			{
				var thisSuck = unwitheredCps*fullWitheredTime;
				Game.wrinklers[i].sucked+=thisSuck;
				cookiesSuckedWrath += thisSuck;
			}

	
			var thisEarned = unwitheredCps*fullWitheredTime;
			Game.Earn(thisEarned);
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
	var secondsAfk = (new Date().getTime()-Game.lastDate)/1000/* - Game.T/Game.fps*/;
	//var secondsAfk = 50*60; 					// for debug
	var framesAfk = secondsAfk*Game.fps;

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
		Game.Notify('AFK: ' + RPI.framesToString(secondsAfk*Game.fps),'Wrinklers sucked <b>'+Beautify(cookiesSucked)+'</b> cookies while you were away.',[19,8],6);
		Game.Notify('AFK: ' + RPI.framesToString(secondsAfk*Game.fps),'You earned <b>'+Beautify(cookiesEarned)+'</b> cookie'+(Math.floor(cookiesEarned)==1?'':'s')+' while you were away.',[10,0],6);
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
