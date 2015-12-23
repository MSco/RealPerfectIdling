// Global Variables
//var ccUrl = 'https://raw.githubusercontent.com/MSco/CookieClicker/master/main.js'
var baseUrl = 'https://rawgit.com/MSco/RealPerfectIdling/master/src/'

// Load external libraries
var script_list = [
  //  ccUrl,
    baseUrl + 'mscostats.js',
    baseUrl + 'realperfectidling.js'
    ]
  
loadInterval = setInterval(function() {
  if (Game && Game.ready) {
    clearInterval(loadInterval);
    loadInterval = 0;
    rpiInit();
  }
}, 1000);

function loadScript(id) 
{
    if (id >= script_list.length) 
    {
        // main stuff
    } 
    else 
    { 
        var url = script_list[id];
        if (/\.js$/.exec(url)) 
        {
            $.getScript(url, function() {loadScript(id + 1);});
        } 
        else if (/\.css$/.exec(url)) 
        {
            $('<link>').attr({rel: 'stylesheet', type: 'text/css', href: url}).appendTo($('head'));
            loadScript(id + 1);
        } 
        else 
        {
            console.log('Error loading script: ' + url);
            loadScript(id + 1);
        }
    }
}

function rpiInit() 
{
  var jquery = document.createElement('script');
  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {loadScript(0);};
  document.head.appendChild(jquery);
}
