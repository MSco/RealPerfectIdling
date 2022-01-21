/* ================================================
    MSco's Real Perfect Idling - A Cookie Clicker plugin

    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  MSco
    Contact: https://www.reddit.com/user/_MSco_

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.

    This add-on simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
    between now and the last time the game was saved. Each feature listed in the readme.md is simulated exactly like in
    the original game.

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

RPI.version = '1.0.3.6'
RPI.supportedVersion = 2.031
if (RPI.supportedVersion < Game.version)
{
	Game.Notify('Unsupported version','MSco\'s Real Perfect Idling has not been tested on this version of Cookie Clicker. Continue on your own risk!',[3,5],6);
}

RPI.calcGCSpawnTime = function()
{
	var min=Game.shimmerTypes.golden.minTime;
	var max=Game.shimmerTypes.golden.maxTime;
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
        if (Game.Has('Lucky digit')) dur*=1.01;
        if (Game.Has('Lucky number')) dur*=1.01;
        if (Game.Has('Lucky payout')) dur*=1.01;
        
        dur *= ((3-Game.elderWrath) / 3.0 * Game.eff('goldenCookieDur')) + (Game.elderWrath / 3.0 * Game.eff('wrathCookieDur'));
        //dur *= Math.pow(0.95,Game.shimmerTypes['golden'].n-1);//5% shorter for every other golden cookie on the screen
	        
		var thisMissed = Math.round(durationFrames/(RPI.calcGCSpawnTime()+dur))
		Game.missedGoldenClicks += thisMissed;
		console.log('Missed Golden Cookies while afk: ' + thisMissed);
	}
}

// 
RPI.calcAdjustedCps = function()
{
    var baseCps = Game.cookiesPs
    var averageLumpMult = 1
    var averageEggMult = 1
    var savedHeraldMult = 1
    
    if (Game.Has('Heralds'))
    {
        baseCps /= 1+0.01*Game.heralds
        savedHeraldMult = 1+0.01*MS.heralds
    }
    
    if (Game.Has('Sugar baking'))
    {
        var currentLumpMult = (1+Math.min(100,Game.lumps)*0.01);
        baseCps /= currentLumpMult;
        
        //Game.sayTime((Date.now()-Game.lumpT)/1000*30)
        var currentSeconds=Math.floor(new Date().getTime()/1000);
        var lastDateSeconds=Math.floor(Game.lastDate/1000);
        var secondsSinceLastSave = currentSeconds-lastDateSeconds
        
        var secondsFromLastLumpToNow = (Date.now()-Game.lumpT)/1000
            
        var currentLumps = Game.lumps
        var newLumpsSinceLastSave = Math.floor((secondsSinceLastSave - secondsFromLastLumpToNow)/60/60/22) + 1
        var lastSaveLumps = currentLumps - newLumpsSinceLastSave
        var secondsFromLastSaveToFirstLump =  (secondsSinceLastSave - secondsFromLastLumpToNow) % (60*60*22)
        
        var lumpIndex;
        
        var bonusFirst = secondsFromLastSaveToFirstLump * (1+Math.min(100,lastSaveLumps)*0.01)
        var bonusLast = secondsFromLastLumpToNow * (1+Math.min(100,currentLumps)*0.01) 
        var bonusSum = bonusFirst + bonusLast
        var bonusTime = 0
        for (lumpIndex=lastSaveLumps+1; lumpIndex<currentLumps; lumpIndex++)
        {
            bonusTime += 60*60*22
            bonusSum += 60*60*22*(1+Math.min(100,lumpIndex)*0.01)
        }
        averageLumpMult = bonusSum / (secondsFromLastSaveToFirstLump + secondsFromLastLumpToNow + bonusTime)
               
        console.log("Sugar lumps last save: " + lastSaveLumps)
        console.log("Sugar lumps added: " + newLumpsSinceLastSave)
        
        // TODO needed:
        // - Zeit von LastSave bis 1. Lump -> (secondsFromLastSaveToFirstLump)
        // - Zeit vom letzten Lump bis jetzt -> (secondsFromLastLumpToNow)
        // - Anzahl der Lumps beim LastSave -> (lastSaveLumps)
        // - Anzahl der neu gewonnenen Lumps vom LastSave bis jetzt -> (lastSaveLumps)
        
    }
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
		var averageEggMultFactor = currentEggMult;

		//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
		var todayDays=Math.floor((new Date().getTime()/*-(Game.T-MS.importSaveT)/Game.fps*1000*/-Game.startDate)/1000/10)*10/60/60/24;
		todayDays=Math.min(todayDays,100);
		var currentCenturyBonus = (1-Math.pow(1-todayDays/100,3))*10
		currentEggMult += currentCenturyBonus;

		var lastDateDays=Math.floor((Game.lastDate-Game.startDate)/1000/10)*10/60/60/24;
		lastDateDays=Math.min(lastDateDays,100);
		var oldCenturyBonus = (1-Math.pow(1-lastDateDays/100,3))*10
		oldEggMult += oldCenturyBonus;

		baseCps /= (1+0.01*currentEggMult);
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
		averageEggMultFactor += averageCenturyBonus;
		averageEggMult = (1+0.01*averageEggMultFactor)
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

        console.log(baseCps)
        console.log(currentEggMult)
        console.log(currentCenturyBonus)
		console.log('CPS without century egg: ' + Beautify(baseCps * (1+0.01*(currentEggMult-currentCenturyBonus))));
		console.log('CPS when game was saved: ' + Beautify(oldCps));
		console.log('Average CPS over ' + numIntervals + ' intervals: ' + Beautify(averageCps));
		//console.log('CPS with half integral century bonus: ' + Beautify(averageCpsNew))
		console.log('Current CPS: ' + Beautify(Game.cookiesPs))
	}
	
	var averageCps = baseCps * averageLumpMult * averageEggMult * savedHeraldMult
	
    console.log('Average lump multiplicator: ' + averageLumpMult)
    console.log('Average egg multiplicator: ' + averageEggMult)
    console.log('Average CPS: '+ Beautify(averageCps))
    
	return averageCps
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

RPI.readVariablesFromSave = function()
{
    if (!MS.saveImported)
    {
        var str='';
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
            if (document.cookie.indexOf(Game.SaveTo)>=0) 
                str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);//get cookie here
        }
        
        MS.readPledgeFromStr(str);
        MS.readHeraldsFromStr(str);
    }
}

RPI.runElderPledge = function(cps, durationSeconds)
{
	Game.pledgeT = MS.pledgeT;
	Game.pledgeT = Math.max(0, Game.pledgeT-(Game.T-MS.importSaveT));
	
	if(Game.pledgeT > 0)
	{
		var secondsRemaining = Math.max(durationSeconds - Game.pledgeT/Game.fps, 0);
		var pledgeSeconds = durationSeconds - secondsRemaining;
		var pledgeEarned = pledgeSeconds*cps;
		Game.Earn(pledgeEarned);

		//if (Game.version <= 1.9)
		Game.pledgeT = Math.max(Game.pledgeT - pledgeSeconds*Game.fps, 0);
			
		if (Game.pledgeT == 0)
		{
			Game.Lock('Elder Pledge');
			Game.Unlock('Elder Pledge');
			Game.elderWrath = 1;
		}
		console.log('Cookies earned from pledge: ' + Beautify(pledgeEarned));
		console.log('Time in pledge: ' + Game.sayTime(pledgeSeconds*Game.fps));

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
		var max = Game.getWrinklersMax();
		while(numWrinklers<max && frames<durationFrames)
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
				if (Game.wrinklers[i].phase==0 && Game.elderWrath>0 && numWrinklers<max && Game.wrinklers[i].id<max)
				{
					var chance = 0.00001*Game.elderWrath;
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
					if (Math.random()<chance) 
					{
						Game.wrinklers[i].phase=2;
						Game.wrinklers[i].hp=Game.wrinklerHP;
						Game.wrinklers[i].type=0;
						if (Math.random()<0.0001) 
							Game.wrinklers[i].type=1; // shiny wrinkler
						
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

		if (numWrinklers >= Game.getWrinklersMax())
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

RPI.undoOfflineEarned = function()
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
			
            if (Game.Has('Fern tea')) percent+=3;
            if (Game.Has('Ichor syrup')) percent+=7;
            if (Game.Has('Fortune #102')) percent+=1;
		}
		
		//var timeOffline=(new Date().getTime()-Game.lastDate)/1000;
		var timeOffline=(MS.importSaveDate-Game.lastDate)/1000;
		var timeOfflineOptimal=Math.min(timeOffline,maxTime);
		var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
		var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);
		
		if (amount>0)
		{
			if (Game.prefs.popups) Game.Popup('Eliminated '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s') + ', in ' + Game.sayTime(timeOfflineOptimal*Game.fps));
			else Game.Notify('Welcome back!','Eliminated <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s') + ', in ' + Game.sayTime(timeOfflineOptimal*Game.fps));
			Game.Earn(-amount);
			console.log('Cookies eliminated: ' + Beautify(amount));
		}
	}
}

RPI.computeGarden = function(durationSeconds)
{
    M=Game.Objects.Farm.minigame
    
    stepDifference = M.nextStep - Date.now()
    steps = Math.floor((durationSeconds+M.stepT-stepDifferrence*1000)/M.stepT)
    secondsLeft = (durationSeconds+M.stepT-stepDifferrence*1000)%M.stepT

    for (var i=0; i<steps; i++) 
    {
        M.nextStep = Date.now()
        M.logic()
    }
    
    M.nextStep -= secondsLeft*1000
}

if (!idleDone)
{
	// how to add button:
	// eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label></div>\'+', 'when out of focus)</label></div>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	// in beta 1.9 (ein zusätzliches Leerzeichen erscheint fälschlicherweise vor dem Button)
	// eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label><br>\'+', 'when out of focus)</label><br>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
	var secondsAfk = (new Date().getTime()-Game.lastDate)/1000 - (Game.T-MS.importSaveT)/Game.fps;
	//var secondsAfk = 50*60; 					// for debug
	var framesAfk = (new Date().getTime()-Game.lastDate)/1000*Game.fps - (Game.T-MS.importSaveT);
	console.log('RPI.version: ' + RPI.version)
	console.log('AFK: ' + Game.sayTime(framesAfk));

	// initialize global values
	var cookiesEarned = 0;
	var cookiesSucked = 0;

    // read some variables from save (pledgeT and heralds)
    RPI.readVariablesFromSave();

	// calculate cps regarding heralds, sugar lumps and century egg
	var averageCps = RPI.calcAdjustedCps();

	// calculate cookies earned during pledge
	var cookiesAndTime = RPI.runElderPledge(averageCps, secondsAfk);
	cookiesEarned += cookiesAndTime[0];
	var secondsRemaining = cookiesAndTime[1];
	
	// calculate cookies earned and sucked during elder wrath
	var earnedAndSucked = RPI.runWrath(averageCps, secondsRemaining);
	cookiesEarned += earnedAndSucked[0];
	cookiesSucked += earnedAndSucked[1];
	
	RPI.undoOfflineEarned();
	
	RPI.addTotalCookies(averageCps, secondsAfk);
	
	
	/*
	// recalculate timers of the current season and current research
	if (Game.version < 1.9)
	{
		if (Game.seasonT > 0)
			Game.seasonT = Math.max(Game.seasonT-secondsAfk*Game.fps, 0);
		if (Game.researchT > 0)
			Game.researchT = Math.max(Game.researchT -secondsAfk*Game.fps, 0);
	}
	*/
	
	RPI.computeGarden(secondsAfk);

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
		Game.Notify('AFK: ' + Game.sayTime(framesAfk),'Wrinklers sucked <b>'+Beautify(cookiesSucked)+'</b> cookies while you were away.',[19,8],6);
		Game.Notify('AFK: ' + Game.sayTime(framesAfk),'You earned <b>'+Beautify(cookiesEarned)+'</b> cookie'+(Math.floor(cookiesEarned)==1?'':'s')+' while you were away.',[10,0],6);
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
