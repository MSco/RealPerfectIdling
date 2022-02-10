// ==UserScript==
// @name MSco Stats
// @namespace MSco
// @downloadURL https://github.com/MSco/RealPerfectIdling/raw/master/mscostats.user.js
// @include http://orteil.dashnet.org/cookieclicker/
// @include https://orteil.dashnet.org/cookieclicker/
// @version 1.0.1
// @grant none
// @author MSco
// ==/UserScript==

(function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://rawgit.com/MSco/RealPerfectIdling/master/src/mscostats.js');
            clearInterval(checkReady);
        }
    }, 500);
})();