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
            console.log('[literal-trees] "svg" event, width:', e.data.width, 'height:', e.data.height, 'svg size:', Math.ceil(e.data.value.length/1000) + 'KB');
            var paperEl = document.getElementById('paper');
            paperEl.innerHTML = "";
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', e.data.width);
            canvas.setAttribute('height', e.data.height);
            var ctx = canvas.getContext('2d');
            paperEl.appendChild(canvas);

            if (window.devicePixelRatio > 1) {
                var canvasWidth = canvas.width;
                var canvasHeight = canvas.height;

                canvas.width = canvasWidth * window.devicePixelRatio;
                canvas.height = canvasHeight * window.devicePixelRatio;
                canvas.style.width = canvasWidth + 'px';
                canvas.style.height = canvasHeight + 'px';
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                console.log('width attribute is', canvas.width);
                console.log('height attribute is', canvas.height);
                console.log('width style attribute is', canvas.style.width);
                console.log('height style attribute is', canvas.style.height);
            }

            var image = new Image();
            image.onload = function () {
                ctx.drawImage(image, 0, 0);
                var anotherImage = document.createElement('img');
                anotherImage.style['max-width'] = '100%';
                anotherImage.style['max-height'] = '100%';
                anotherImage.style.display = 'block';
                anotherImage.style.margin = 'auto';
                anotherImage.src = canvas.toDataURL();
                paperEl.innerHTML = "";
                paperEl.appendChild(anotherImage);
            }
            image.src = 'data:image/svg+xml,' + escape(e.data.value);
            // -- canvg -- var canvas = document.createElement('canvas');
            // -- canvg -- var ctx = canvas.getContext('2d');
            // -- canvg -- canvas.id = 'tree-canvas';
            // -- canvg -- // canvas.width = e.data.width;
            // -- canvg -- // canvas.height = e.data.height;
            // -- canvg -- document.getElementById('paper').appendChild(canvas);
            // -- canvg -- canvg('tree-canvas', e.data.value);

            // -- canvg -- setTimeout(function() {
            // -- canvg --     if (window.devicePixelRatio > 1) {
            // -- canvg --         var canvasWidth = e.data.width;
            // -- canvg --         var canvasHeight = e.data.height;
            // -- canvg --         canvas.width = canvasWidth * window.devicePixelRatio;
            // -- canvg --         canvas.height = canvasHeight * window.devicePixelRatio;
            // -- canvg --         canvas.style.width = canvasWidth + 'px';
            // -- canvg --         canvas.style.height = canvasHeight + 'px';
            // -- canvg --         ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            // -- canvg --         console.log('width attribute is', canvas.width);
            // -- canvg --         console.log('height attribute is', canvas.height);
            // -- canvg --         console.log('width style attribute is', canvas.style.width);
            // -- canvg --         console.log('height style attribute is', canvas.style.height);
            // -- canvg --     }
            // -- canvg -- }, 1);

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
