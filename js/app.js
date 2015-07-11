var timers = require('./timer-utils');
timers.startTimer('click to loaded');
var qs = require('./diet-qs-no-sugar');
var chroma = require('chroma-js');
var query = qs.parse(window.location.search.substr(1));
var utils = require('./utils');

var IS_DEBUG = query.debug;
var messageColor = 'black';
var bgcolor = 'white';
var color = 'black';

if (query.color) {
    try {
        // Coerce to a string so chroma doesn't think it's a number and
        // subsequently parse as part of an RGB triple
        color = chroma("" + query.color).css();
    } catch(e) {
        console.warn('Unknown foreground color: ' + query.color);
    }
}

if (query.bgcolor) {
    try {
        if (query.bgcolor === 'transparent') {
            // If bgcolor is transparent, don't try to parse it.
            bgcolor = query.bgcolor;
        } else {
            // Else, do try and parse it.
            bgcolor = chroma("" + query.bgcolor).css();
        }
    } catch (e) {
        console.warn('Unknown color: ' + query.bgcolor + ', defaulting to ' + bgcolor);
    }

    if (typeof query.color === 'undefined') {
        // var contrastBlack = chroma.contrast(bgcolor, "black");
        // var contrastWhite = chroma.contrast(bgcolor, "white");
        // if (contrastBlack > contrastWhite) {
        //     messageColor = "black"
        // } else {
        //     messageColor = "white"
        // }
        messageColor = color; // More consistent to just always make this match the color
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
        case 'log':
            if (IS_DEBUG) {
                if (document.getElementById('logging')) {
                    logging.innerHTML = logging.innerHTML + "\n" + e.data.msg;
                } else {
                    var logging = document.createElement('pre');
                    logging.id = 'logging';
                    logging.innerHTML = e.data.msg;
                    logging.style.position = 'fixed';
                    logging.style.background = 'gray';
                    logging.style['z-index'] = 10;
                    logging.style.borderRadius = 0;
                    logging.style.opacity = 0.9;
                    logging.style.border = 'none';
                    document.body.insertBefore(logging, document.getElementById('paper'));
                }
            }
            break;
        case 'seed':
            seed = e.data.value;
            console.log('[literal-trees] seed value is', seed);
            var link = document.getElementById("persistant-link");
            var printedSeed = document.getElementById("seed-printed");
            var url;
            if (/^[A-Z_]+$/.test('LITERAL_TREES_VERSION')) {
                // Assert: has not been replaced with the version number -- this is localhost for testing
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
            timers.endTimer('svg computed');
            if (query.svg) {
                // User explicitly asked for SVG only
                document.getElementById('paper').innerHTML = e.data.value;
            } else {
                // Else go through the rasterizing process to get a bitmap
                // image.
                timers.startTimer('total client-side raster');
                var paperEl = document.getElementById('paper');
                // paperEl.innerHTML = "";
                var canvasWidth = Math.ceil(e.data.width);
                var canvasHeight = Math.ceil(e.data.height);
                var canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                var ctx = canvas.getContext('2d');
                // paperEl.appendChild(canvas);

                if (window.devicePixelRatio > 1) {
                    canvas.width = canvasWidth * window.devicePixelRatio;
                    canvas.height = canvasHeight * window.devicePixelRatio;
                    canvas.style.width = canvasWidth + 'px';
                    canvas.style.height = canvasHeight + 'px';
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                }

                var svgImage = new Image();
                svgImage.onload = function () {
                    timers.endTimer('raster.image/svg+xml.onload');
                    ctx.fillStyle = bgcolor;
                    ctx.fillRect(0, 0, Math.ceil(e.data.width), Math.ceil(e.data.height));
                    ctx.drawImage(svgImage, 0, 0);

                    var container = document.createElement('div');
                    utils.applyStyles(container, {
                        width: '100%',
                        height:'95%',
                        margin: 'auto',
                        position: 'absolute',
                        bottom: 0
                    });

                    var rasterImage = document.createElement('img');
                    utils.applyStyles(rasterImage, {
                        'max-width': '100%',
                        'max-height': '100%',
                        display: 'block',
                        margin: 'auto'
                    });
                    rasterImage.onload = function() {
                        timers.endTimer('raster.image/png.onload');
                        timers.startTimer('raster.image/png.appended-to-dom');
                        paperEl.innerHTML = "";
                        paperEl.appendChild(container);
                        container.appendChild(rasterImage);
                        timers.endTimer('raster.image/png.appended-to-dom');
                        timers.endTimer('click to loaded');
                        setTimeout(function() {
                            // This is happening.
                            var mediaQuery = document.createElement('style');
                            var style = '@media screen and (max-width : ' + rasterImage.width + 'px) { #paper div img { position:absolute; bottom:0; } }';
                            mediaQuery.innerHTML = style;
                            document.head.appendChild(mediaQuery);
                            timers.endTimer('total client-side raster');
                        }, 1)
                    }
                    timers.startTimer('raster.image/png.onload');
                    rasterImage.src = canvas.toDataURL();
                }
                timers.startTimer('raster.image/svg+xml.onload');
                svgImage.src = 'data:image/svg+xml,' + escape(e.data.value);
            }
            break;
    }
};


timers.startTimer('svg computed');
w.postMessage({
    event: 'inputs',
    paperWidth: window.innerWidth, // TODO: remove when backward functionality not required
    paperHeight: window.innerHeight, // TODO: remove when backward functionality not required
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
    screenWidth: window.screen && window.screen.width,
    screenHeight: window.screen && window.screen.height,
    seed: window.location.hash.substr(1), // Always returns "" or the actual hash
    debug: query.debug,
    windx: query.windx,
    windy: query.windy,
    trunkangle: query.trunkangle,
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
    showbranches: query.showbranches,
    sizingmethod: query.sizingmethod
});
