var qs = require('querystring');
var download = require('./download');
var chroma = require('chroma-js');
var query = qs.parse(window.location.search.substr(1));

var messageColor = 'black';
var bgcolor = 'transparent';
var color = 'black';

if(query.color) {
    try {
        color = chroma(query.color).css();
    } catch(e) {
        console.warn('Unknown foreground color: ' + query.color);
    }
}

if (query.bgcolor) {
    try {
        bgcolor = chroma(query.bgcolor).css();
    } catch (e) {
        console.warn('Unknown color: ' + query.bgcolor + ', defaulting to transparent');
        bgcolor = 'transparent';
    }

    if (typeof query.color === 'undefined') {
        var contrastBlack = chroma.contrast(bgcolor, "black");
        var contrastWhite = chroma.contrast(bgcolor, "white");
        if (contrastBlack > contrastWhite) {
            messageColor = "black"
        } else {
            messageColor = "white"
        }
    } else {
        messageColor = color;
    }
}
document.getElementById("paper").style.backgroundColor = bgcolor;
document.getElementById("loading-message").style.color = messageColor;

var extraCSS = "";
if (query.maxprintheight) {
    extraCSS += "#paper { height:" + query.maxprintheight + "!important; }";
}
if (query.maxprintwidth) {
    var matches = query.maxprintwidth.match(/(\d+)(.*)/);
    var value = matches[1];
    var units = matches[2];
    // Set the width and then add a left and margin-left to center
    // horizontally.
    extraCSS += "#paper { width:" + query.maxprintwidth + "; }";
    extraCSS += "#paper { left:50%; }";
    extraCSS += "#paper { margin-left: -" + (value/2) + units + "; }";
}
if (extraCSS) {
    var style = document.createElement('style');
    style.innerHTML = "@media print {" + extraCSS + "}";
    document.head.appendChild(style);
}

var seed;
var w = new Worker('js/main.bundled.js');
w.onmessage = function(e) {
    // console.log('[index.html] Got "' + e.data.event + '" message from worker');
    switch(e.data.event) {
        case 'seed':
            seed = e.data.value;
            console.log('Seed value is', seed);
            var link = document.getElementById("persistant-link");
            var printedSeed = document.getElementById("seed-printed");
            var url;
            if ('LITERAL_TREES_VERSION' === 'LITERAL_' + 'TREES_' + 'VERSION') {
                // Assert: this is localhost for testing
                url = window.location.origin + window.location.search + '#' + seed;
            } else if (window.location.host === 'ahw.github.io') {
                // Assert: this is a GitHub pages site
                url = window.location.origin + '/literal-trees/v/LITERAL_TREES_VERSION/' + window.location.search + '#' + seed;
            } else {
                // Assert: This is hosted on a real domain.
                url = window.location.origin + '/v/LITERAL_TREES_VERSION/' + window.location.search + '#' + seed;
            }

            link.href = url;
            link.innerHTML = seed;
            printedSeed.innerHTML = seed;
            document.getElementById("persistant-link-container").style.visibility = "visible";
            break;
        case 'metrics':
            // (new Image()).src ='http://localhost:8800/metrics?' + e.data.value;
            break;
        case 'svg':
            // document.getElementById('loading-message').style.display = 'none';
            // var html = document.getElementById("paper").innerHTML;
            document.getElementById('paper').innerHTML = e.data.value;
            // document.getElementById("download-link").setAttribute('href', "data:text/svg," + e.data.value);
            document.getElementById("download-link").onclick = function(ev) {
                ev.preventDefault();
                download(e.data.value, 'tree-' + seed + '.svg', 'text/svg');
            };
            break;
    }
};

w.postMessage({
    event: 'inputs',
    width: window.innerWidth,
    height: window.innerHeight,
    seed: window.location.hash.substr(1), // Always returns "" or the actual hash
    debug: query.debug,
    windx: query.windx,
    windy: query.windy,
    ta: query.ta,
    trunkheight: query.trunkheight,
    color: color,
    bgcolor: query.bgcolor,
    depth: query.depth,
    arm: query.arm,
    arv: query.arv,
    co: query.c,
    bat: query.ba,
    bld: query.bld,
    co: query.co,
    ce: query.ce,
    margin: query.margin,
    showbranches : !(query.showbranches == 0)
});
