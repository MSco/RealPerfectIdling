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
javascript:(function(){with(document)(head.appendChild(createElement('script')).src='https://raw.githubusercontent.com/MSco/RealPerfectIdling/master/src/mscostats.js')._})();
```

* Paste the following code into a second new bookmark (Real Perfect Idling) in your browser:

```javascript
javascript:(function(){with(document)(head.appendChild(createElement('script')).src='https://raw.githubusercontent.com/MSco/RealPerfectIdling/master/src/realperfectidling.js')._})();
```

* Load up [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/)
* Click on your first recently created bookmark (MSco Stats)
* Either import a save or not. **Important: Do not import a save, before you called MSco Stats!!!**
* Click on your second created bookmark (Real Perfect Idling)

MSco Stats Features
----------
* Original strings in statistics menu changed:
	* Overloaded sayTime function: Time is displayed a bit more detailed now.
	* cookies per second not affected by frenzy multipliers
	* multiplier not affected by frenzy multipliers
	* Cookies in bank includes wrinkler reward
	* Cookies in baked (this game and all time) includes wrinkler reward and chocolate egg reward
* Show Cookies in bank needed to get the maximum reward of Lucky, a Frenzy-Lucky-Combo or a Dragon-Lucky-Combo (incl. time left to get it)
* Show maximum of cookies you can spend without getting under the Frenz-Lucky optimized bank
* Show reward for eldeers and elder frenzy with wrinklers
* Show Cookies you would earn after popping all wrinklers
* Show Cookies earned per hour with 10 active wrinklers
* Show max. Cookies earned (includes sucked cookies and chocolate egg reward)
* Show Heavenly Chips you would earn additionally after resetting this game (including sucked cookies and chocolate egg)
* Calculate Base Cost per Income (BCI) for each building and show their efficiencies corresponding the best BCI
* Show how much cookies you have to generate (all time) to add a specified number of HCs (specified via number input)
* Show Price for next Dragon Level
* Game-Breaking Bugs of beta 1.9 are fixed.
