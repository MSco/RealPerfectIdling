MSco's RealPerfectIdling
=================

MSco's RealPerfectIdling is a browser plugin for [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/).

It simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
between now and the last time the game was saved. Each feature listed below is simulated exactly as in
the original game.


How To Use
----------

MSco's RealPerfectIdling is available via a bookmarklet:

* Paste the following code into a new bookmark (MSco Stats) in your browser:

```javascript
javascript:(function(){with(document)(head.appendChild(createElement('script')).src='https://rawgit.com/MSco/RealPerfectIdling/master/src/mscostats.js')._})();
```

* Paste the following code into a second new bookmark (Real Perfect Idling) in your browser:

```javascript
javascript:(function(){with(document)(head.appendChild(createElement('script')).src='https://rawgit.com/MSco/RealPerfectIdling/master/src/realperfectidling.js')._})();
```

* Load up [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/)
* Click on your first recently created bookmark (MSco Stats)
* Either import a save or not. **Important: Do not import a save, before you called MSco Stats!!!**
* Click on your second created bookmark (Real Perfect Idling)

MSco Stats
----------
This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
with or without permission from, nor credit given to the original author (me). Please send an email to me if you
have any suggestions.

* Original strings in statistics menu changed:
	* Overloaded sayTime function: Time is displayed a bit more detailed now.
	* cookies per second not affected by frenzy multipliers
	* multiplier not affected by frenzy multipliers
	* Cookies in bank includes wrinkler reward
	* Cookies baked (this game and all time) include wrinkler reward and chocolate egg reward
* You can specify a wanted amount of cookies (bank, baked this game or baked all time) and see how long it will take to get it.
* Show Cookies in bank needed to get the maximum reward of Lucky, a Frenzy-Lucky-Combo or a Dragon-Lucky-Combo (incl. time left to get it)
* Show Cookies in bank needed to get the maximum reward of a Cookie Chain in Clot, Plain, Frenzy or Dragon Harvest mode. During an active cookie chain, the corresponding cookie chain stats are colored green in the menu.
* Show maximum of cookies you can spend without getting under the Frenz-Lucky optimized bank
* Show reward for eldeers and elder frenzy with wrinklers
* Show Cookies you would earn after popping all wrinklers
* Show Cookies earned per hour with 10 active wrinklers
* Show max. Cookies earned (includes sucked cookies and chocolate egg reward)
* Show Heavenly Chips you would earn additionally after resetting this game (including sucked cookies and chocolate egg)
* Calculate Base Cost per Income (BCI) for each building and show their efficiencies corresponding to the best BCI
* Show how much cookies you have to generate (all time) to add a specified number of HCs (specified via number input)
* Show Price for next Dragon Level
* Show next Lump Type

##### Changelog:
* 1.1.3.0:
    * Added next grimore occurrences for click frenzy, building special and free sugar lump
* 1.1.2.14:
    * Disable F5 if lump type is golden or caramelized
* 1.1.2.12:
    * Disable F5 if lump type is golden
* 1.1.2.11:
    * Show next Lump Type#
    * Store offline earned amount during importsave in a variable for RealPerfectIdling
* 1.1.2.2:
    * Compatibility with version 2.031
* 1.1.2:
	* Estimated date now also shows day and month
* 1.1.1:
	* Fixed Chocolate Egg Reward. Sell reward was not calculated correctly. 
	* Fixed issue that caused writing the remaining cookies for buildings into the input field for cookies wanted in bank.
	* Numbers in input fields are not converted anymore, e.g. 108e30 was converted to 1.08E+32.
	* Remember input value of input field for HCs wanted.
	* Scientific notation allowed for HCs wanted.
	* Fixed typo in description of next cps for cookie chain
* 1.1.0:
	* New feature added: You can specify a wanted amount of cookies (bank, baked this game or baked all time) and see how long it will take to get it.
	
* 1.0.10:
	* Fixed wrinkler cookies per hour calculation for 12 wrinklers
* 1.0.9:
	* Added estimated date
	* Removed initial amount of buildings and the required minimum value
	* Fixed resetting of wanted amount of buildings after switching the menu
* 1.0.8:
	* Tooltips added
	* Fixed plural 's' of Game.sayTime 
	* Fixed bug with calculation of golden switch that occured if golden switch had not been used during the current ascension
* 1.0.7:
	* Show version number of MSco Stats
	* Game.sayTime also shows years if time >= 365 days.
* 1.0.6:
	* Calculation for Time Left (with wrinklers) now also includes the Golden Switch, even if the Switch is off.
	* Real cookies per hour now also includes the Golden Switch, even if the Switch is off.
	* Lucky Banks not affected by dragon aura multipliers for golden and wrath cookies
* 1.0.5:
	* Compatibility with version 2.0
	* Rewards of Lucky, Frenzy Lucky and Dragon Harvest Lucky are re-added to the stats
	* Lucky, Cookie Chain, frenzied reindeer and full elder frenzy stats not affected by Golden Switch
* 1.0.4:
	* Compatibility with beta 1.907
* 1.0.3:
	* Compatibility with beta 1.903
* 1.0.2:
	* Added remaining Price for a user-specified amount of buildings (via input number field)
	* Show time left to get remaining price
	* Focus of input textfields working correctly now
* 1.0.1:
	* Performance upgrade for calculating BCI
	* Dragon Harvest Stats only shown for Game.version>=1.9
* 0.9.13:
	* Appropriate Cookie Chain stats are colored if Cookie Chain is active
* 0.9.12:
	* Building price colors depend on efficiency
	* MSco Stats Menu is shown in a table
* 0.9.11:
	* Added number input for HCs you want to generate this run
	* Show Price for next Dragon Level
	* Show the time left to get bank for Lucky-Combos
* 0.9.10:
	* Removed HC stuff
	* Added Dragon Lucky Bank
	* Added Cookie Chain
* 0.9.9:
	* Compatibility with beta 1.9
* 0.9.8:
	* Compatibility with beta 1.0501
* 0.9.7:
	* interface titles have been split up
	* Cookies in bank includes wrinkler reward
* 0.9.6:
	* cps and multiplier statistic strings not affected by frenzy multipliers
	* Show reward for eldeers and elder frenzy with wrinklers
* 0.9.5:
	* BCI is gerenerated by a dynamic loop
	* Show Heavenly Chips earned all time
	* Also show max Chocolate egg reward
	* Max. cookies earned
	* Check for Chocolate Upgrade unlocked and not used
* 0.9.4:
	* Ads have been removed by orteil in v1.0465, so the ad remove code is not needed anymore.
* 0.9.3:
	* Remove ads from easter update
* 0.9.2:
	* Overloaded sayTime 
* 0.9.1:
	* Regarding 'Wrinklerspawn' from Easter Upgrade for 'Full withered Cookies per hour' and 'Cookies rewarded killing wrinklers'
* 0.9.0:
	* New method to calculate income of buildings: Simulate buy and calculate cps.
* 0.8.2:
	* Regard Cookies to be rewarded killing wrinklers for calculation of Heavenly Chips earned this game
* 0.8.1:
	* Modified some description strings (e.g. Frenzy Lucky instead of Frenzy+Lucky)
* 0.8:
	* Initial Version with first features:
		* FL Bank, FL reward, spend cookies for FL bank
		* wrinklers reward, wrinklers cph
		* bci efficiency

![MSco Stats and main game window](https://rawgit.com/MSco/RealPerfectIdling/master/images/MScoScreen1-withborders.jpg "Main Window in MSco Stats")

![Special Menu in MSco Stats](https://rawgit.com/MSco/RealPerfectIdling/master/images/MScoScreen2-withborders.jpg "Special Menu in MSco Stats")

Real Perfect Idling 
----------
This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
with or without permission from, nor credit given to the original author (me). Please send an email to me if you
have any suggestions.
This add-on simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
between now and the last time the game was saved. The game loops a modified version of Game.Logic() to simulate the
game running from 'lastDate' to now.

Following calculations are done "while game is closed":
* Simulate the game using a modified version of Game.Logic() (without graphic stuff, etc)
* Undo offline cookie calculations of Twin Gates of Transcendence

##### Changelog:
* 2.0.0.0:
    * Full Reimplementation of the plugin. It now simulates the game using a modified version of Game.Logic() (without graphic stuff, etc)
* 1.0.4.0:
    * Added support for Garden Minigame
    * Added support for Grimore Minigame
    * Added support for Stock Market Minigame
    * Added support for Pantheon Minigame
* 1.0.3.2:
    * Use saved heralds for cps calculation instead of current heralds
* 1.0.3:
    * Compatibility with version 2.031
    * Implementation of variable sugar lump cps bonus for 'Sugar baking' 
* 1.0.2:
	* Compatibility with version 2
* 1.0.1:
	* Compatibility with beta 1.903
* 0.9.9:
	* Undo offline cookie calculations of Twin Gates of Transcendence
	* TotalCookies are added to each building
* 0.9.8:
	* Beta 1.9 support
* 0.9.7:
	* Beta 1.0501 support
* 0.9.6:
	* Century egg calculation averaged by a specific number of intervals
* 0.9.5:
	* Substract saveImportT from Game.T, saveImportT is messured by MScoStats
	* Increase variable Game.cookiesSucked
* 0.9.4:
	* Show message if Game.version is not supported
	* Subtract Game.T (time after last reload) from afk time
* 0.9.3:
	* Implemented more methods to split up main code
	* Own method to generate time string
* 0.9.2:
	* New calculation of average Golden Cookie spawn time, used for missedGoldenCookies
	* Output of 'Missed Golden Cookies while afk' in console.
* 0.9.1:
	* New calculation of cps boost of 'Century egg' as in v1.0465
* 0.9.0:
	* recalculate CPS regarding 'Century egg'
* 0.8.0:
	* Recalculate pledge timer
	* Activate elder wrath after pledge
	* Earn cookies during pledge
* 0.7.2:
	* Recalculate research timer
* 0.7.1:
	* Add missed Golden Cookies
* 0.7.0:
	* Initial Version with first features:
		* wrinklers spawn
		* wrinklers suck
		* reduce cps
		* increase elder wrath
		* decrease season duration
		* earn cookies
