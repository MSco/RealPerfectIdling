// ==UserScript==
// @name MSco Stats
// @id mscostats
// @version 1.0.4
// @author MSco
// @namespace https://github.com/MSco/RealPerfectIdling
// @updateURL https://github.com/MSco/RealPerfectIdling/raw/master/mscostats.user.js
// @downloadURL https://github.com/MSco/RealPerfectIdling/raw/master/mscostats.user.js
// @include http://orteil.dashnet.org/cookieclicker/
// @include https://orteil.dashnet.org/cookieclicker/
// @grant none
// ==/UserScript==

(function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://rawgit.com/MSco/RealPerfectIdling/master/src/mscostats.js');
            clearInterval(checkReady);
        }
    }, 800);
})();
