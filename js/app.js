var qs = require('./diet-qs-no-sugar');
var download = require('./download');
var chroma = require('chroma-js');
var query = qs.parse(window.location.search.substr(1));
var utils = require('./utils');

var IS_DEBUG = query.debug;
var messageColor = 'black';
var bgcolor = 'transparent';
var color = 'black';

if(query.color) {
    try {
        // Prefix with "#" so chroma doesn't think it's a Number and try to
        // parse as part of an RGB triple
        color = chroma('#' + query.color).css();
    } catch(e) {
        console.warn('Unknown foreground color: ' + query.color);
    }
}

if (query.bgcolor) {
    try {
        bgcolor = chroma('#' + query.bgcolor).css();
    } catch (e) {
        console.warn('Unknown color: ' + query.bgcolor + ', defaulting to transparent');
        bgcolor = 'transparent';
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
            if (query.raster) {
                // console.log('[literal-trees] "svg" event, width:', e.data.width, 'height:', e.data.height, 'svg size:', Math.ceil(e.data.value.length/1000) + 'KB');
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
                        paperEl.innerHTML = "";
                        paperEl.appendChild(container);
                        container.appendChild(rasterImage);
                        setTimeout(function() {
                            // This is happening.
                            var mediaQuery = document.createElement('style');
                            var style = '@media screen and (max-width : ' + rasterImage.width + 'px) { #paper div img { position:absolute; bottom:0; } }';
                            mediaQuery.innerHTML = style;
                            document.head.appendChild(mediaQuery);

                        }, 1)
                    }
                    rasterImage.src = canvas.toDataURL();
                }
                svgImage.src = 'data:image/svg+xml,' + escape(e.data.value);

            } else {
                document.getElementById('paper').innerHTML = e.data.value;

            }

            // document.getElementById('loading-message').style.display = 'none';
            // var html = document.getElementById("paper").innerHTML;
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
