/* ================================================
    MSco's Real Perfect Idling - A Cookie Clicker plugin

    GitHub:  https://github.com/MSco/RealPerfectIdling
    Author:  MSco
    Contact: https://www.reddit.com/user/_MSco_

    This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
    with or without permission from, nor credit given to the original author (me). Please send an email to me if you
    have any suggestions.

    This add-on simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
    between now and the last time the game was saved. 
    
/*================================================ */
var RPI={}

RPI.version = '2.0.3.1'
RPI.supportedVersion = 2.031
if (RPI.supportedVersion < Game.version)
{
	Game.Notify('Unsupported version','MSco\'s Real Perfect Idling has not been tested on this version of Cookie Clicker. Continue on your own risk!',[3,5],6);
}

RPI.functions_to_disable = [
	'Game.Loop',
	'Game.Draw',
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

RPI.original_functions = new Array(RPI.functions_to_disable.length)

RPI.lock_functions = function()
{
	for (var i=0; i<RPI.functions_to_disable.length; i++)
	{
		RPI.original_functions[i] = eval(RPI.functions_to_disable[i])
		eval(eval('RPI.functions_to_disable[i]')+ '=function(a=0,b=0){}')
	}
}

RPI.unlock_functions = function()
{
	for (var i=0; i<RPI.functions_to_disable.length; i++)
	{
		eval(eval('RPI.functions_to_disable[i]')+ '=RPI.original_functions[i]')
	}
}

RPI.now = function()
{
	return Math.round(Game.lastDate + Game.T/Game.fps*1000)
}

RPI.undoOffline = function(framesAfk)
{
	var amount = 0
	if (MS.offlineEarned > 0)
	{
		amount = MS.offlineEarned
		if (Game.prefs.popups) Game.Popup('Eliminated '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s'));
		else Game.Notify('Welcome back!','Eliminated <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s'));
		Game.Earn(-amount);
		console.log('Cookies eliminated: ' + Beautify(amount));
	}
	
	// undo adjustment of pledge, season and research timers 
	if (Game.pledgeT > 0)
		Game.pledgeT += framesAfk
	if (Game.seasonT > 0)
		Game.seasonT += framesAfk
	if (Game.researchT > 0)
		Game.researchT += framesAfk
	
}

RPI.undoLumps = function()
{
	Game.lumps=MS.lumps;
	Game.lumpsTotal=MS.lumpsTotal;
	Game.lumpT=MS.lumpT;
	Game.lumpCurrentType=MS.lumpCurrentType;
}

if (!MS.RPI_idledone)
{
	// how to add button:
	// eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label></div>\'+', 'when out of focus)</label></div>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	// in beta 1.9 (ein zusätzliches Leerzeichen erscheint fälschlicherweise vor dem Button)
	// eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace('when out of focus)</label><br>\'+', 'when out of focus)</label><br>\'+\'<div class="listing"><a class="option" \'+Game.clickStr+\'="myfunc();">Real Perfect Idling</a><label>Simulate the game untilt the last Save)</label></div>\' + '))
	
//	var framesAfk = Game.fps*60*60*10; 					// for debug
	var framesAfk = (Date.now()-Game.lastDate)/1000*Game.fps;
	console.log('RPI.version: ' + RPI.version)
	console.log('AFK: ' + Game.sayTime(framesAfk));

	// Set Garden nextStep correctly
	Game.Objects.Farm.minigame.nextStep -= (Date.now()-Game.lastDate)

	RPI.original_date_now = Date.now
	Date.now = RPI.now

	RPI.lock_functions();

	// rewrite some functions
	eval('RPI.doLumps='+Game.doLumps.toString().replace(/l\(\'.*;/g, ""));
	eval('RPI.UpdateGrandmapocalypse='+Game.UpdateGrandmapocalypse.toString().replace("Game.UpdateWrinklers();", "RPI.UpdateWrinklers();"));
	eval('RPI.UpdateWrinklers='+Game.UpdateWrinklers.toString().replace(/var d\=128\*\(2\-me\.close\)[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*Game\.mousePointer\=1;/,"}"))
	eval('RPI.UpdateWrinklers='+RPI.UpdateWrinklers.toString().replace(/for \(var i in Game\.wrinklers\)[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*for \(var i in Game\.wrinklers\)/,"var n = Game.wrinklers.filter(obj => obj.phase > 0).length; for (var i in Game.wrinklers)"))

	// rewrite Game.Logic	
	RPI.Logic = Game.Logic;
	eval('RPI.Logic='+RPI.Logic.toString().replace("Game.bounds=Game.l.getBoundingClientRect();", ""))
	eval('RPI.Logic='+RPI.Logic.toString().replace(/if \(Game.prefs.wobbly\)[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*Game\.mousePointer=0;/, ""))
	eval('RPI.Logic='+RPI.Logic.toString().replace(/if \(\!Game\.promptOn\)[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*\/\/handle cookies/, "\/\/handle cookies"))
	eval('RPI.Logic='+RPI.Logic.toString().replace(/l\(\'.*;/g, "{}"))
	eval('RPI.Logic='+RPI.Logic.toString().replace("Game.doLumps()", "RPI.doLumps()"))
	eval('RPI.Logic='+RPI.Logic.toString().replace(/if \(Game\.T\%\(Game\.fps\*2\)\=\=0\)[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*Game\.T\+\+;/, "Game\.T\+\+"))
	
	//eval('RPI.Logic='+RPI.Logic.toString().replace(/Game\.UpdateSpecial\(\);[a-zA-Z0-9\s\{\}\(\)\[\]\.\=\+\-\*\/\%;\,\'\"\!\|\&\>\<\?\:\\]*Game\.UpdateTicker\(\);/, ""))
	//eval('RPI.Logic='+RPI.Logic.toString().replace("me.minigame.logic();", "{}"))
	RPI.undoLumps();
	
	RPI.undoOffline(framesAfk)
	
	// first calculation
	start_calc_time = RPI.original_date_now()
	for (var i=0; i<framesAfk; i++)
	{
		RPI.Logic()
	}
	end_calc_time = RPI.original_date_now()
	calc_time = end_calc_time - start_calc_time
	
	frames_calc_time = Math.floor(calc_time/1000*Game.fps)
	console.log("Calculation time: " + Game.sayTime(frames_calc_time))
	
	Game.harvestLumps = MS.harvestLumps;
	RPI.unlock_functions();
	Date.now = RPI.original_date_now 
	MS.RPI_idledone=1;
}
else
{
	if (Game.prefs.popups)
		Game.Popup('Nothing done! You already used this addon after loading! Do not use it to cheat! :)');
	else
		Game.Notify('Nothing done!','You already used this addon after loading! Do not use it to cheat! :)',[3,5],6);
}


