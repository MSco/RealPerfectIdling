MSco's RealPerfectIdling
=================

MSco's RealPerfectIdling is a browser plugin for [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/).

It simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
between now and the last time the game was saved. Each feature listed below is simulated exactly like in
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

![MSco Stats and main game window](https://rawgit.com/MSco/RealPerfectIdling/master/images/MScoScreen1-withborders.jpg "Main Window in MSco Stats")

![Special Menu in MSco Stats](https://rawgit.com/MSco/RealPerfectIdling/master/images/MScoScreen2-withborders.jpg "Special Menu in MSco Stats")

Real Perfect Idling 
----------
This code was written to be used, abused, extended and improved upon. Feel free to do with it as you please, 
with or without permission from, nor credit given to the original author (me). Please send an email to me if you
have any suggestions.
This add-on simulates cookies earned and cookies sucked while the game is closed. It calculates the amount of time
between now and the last time the game was saved. Each feature listed below is simulated exactly like in
the original game.


Following calculations are done "while game is closed":
* Undo offline cookie calculations of Twin Gates of Transcendence
* Wrinklers spawn if elder wrath is active as in the original game with all Math.random() stuff etc. ...
* Wrinklers suck cookies (also increasing Game.cookiesSucked)
* CPS is reduced while wrinklers suck the big cookie
* Elder wrath increases
* Season timer decreases (Removed for 1.9, because its done ingame)
* Research timer decreases (Removed for 1.9, because its done ingame)
* Cookies are earned from global cps (concerning the reduced cps because of wrinklers)
* Add missed Golden Cookies
* Recalculate CPS regarding 'Century egg' from easter update. An approximation to the original algorithm of 100 intervals between CPS of last save and current CPS is calculated for this.
* TotalCookies are added to each building (for Achievements like: Make x cookies just from y)
