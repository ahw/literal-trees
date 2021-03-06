var timers = require('./timer-utils');
var qs = require('./diet-qs-no-sugar');
var _ = require('underscore');
var chroma = require('chroma-js');
var query = qs.parse(window.location.search.substr(1));
var utils = require('./utils');
var DebugLogger = require('./debug-logger');
var LOG = new DebugLogger();
// require('../bower_components/history/scripts/bundled/html5/native.history.js');

var detect = require('./interaction-mode-detector');
window.lt = {};
detect(window.lt, function(interactionMode) {
    LOG.log('Interaction mode:', window.lt.interactionMode);
    LOG.log('Has touch:', window.lt.hasTouch);
    document.onpointerdown = false;
    document.ontouchstart = false;
    document.onmousedown = false;
    document.onkeydown = false;
});

var bgcolor = 'white';
var color = 'black';

if (query.color) {
    try {
        // Coerce to a string so chroma doesn't think it's a number and
        // subsequently parse as part of an RGB triple
        color = chroma("" + query.color).css();
    } catch(e) {
        console.warn('Unknown foreground color: ' + query.color + ', default to ' + color);
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
}
document.getElementById("paper").style.backgroundColor = bgcolor;
document.getElementById("loading-message").style.color = color;

var extraCSS = "";
if (query.maxprintheight) {
    extraCSS += "#paper { height:" + query.maxprintheight + "!important; }";
}

if (query.maxprintwidth) {
    var matches = query.maxprintwidth.match(/([\.\d]+)([a-z]*)/);
    var value = matches[1];
    var units = matches[2];
    // Set the width and then add a left and margin-left to center
    // horizontally.
    extraCSS += "#paper { width:" + query.maxprintwidth + "; }";
    extraCSS += "#paper { left:50%; }";
    extraCSS += "#paper { margin-left: -" + (value/2) + units + "; }";
    extraCSS += "#paper img { position:absolute; bottom:0; }";
}

if (query.printseed === 0) {
    extraCSS += "#seed-printed { display: none; }";
    extraCSS += "#paper { bottom: 0; }";
}

if (extraCSS) {
    var style = document.createElement('style');
    style.innerHTML = "@media print {" + extraCSS + "}";
    document.head.appendChild(style);
}


// Set up various UI things
// -- var inputCells = Array.prototype.slice.call(document.querySelectorAll('td.input'));
// -- inputCells.forEach(function(input) {
// --     input.addEventListener('click', function(e) {
// --         // Focus the <input> element contained inside
// --         e.currentTarget.querySelector('input').focus();
// --     });
// -- });

var rerenderNewSeed = document.getElementById('rerender-new-seed');
var rerenderOldSeed = document.getElementById('rerender-old-seed');

rerenderNewSeed.addEventListener('click', function(e) {
    if (window.lt.hasTouch) {
        return; // Ignore since this is just a touch bubbling up
    }
    e.preventDefault();
    rerender(false);
});

rerenderOldSeed.addEventListener('click', function(e) {
    if (window.lt.hasTouch) {
        // LOG.log('Ignoring click event since hasTouch = true');
        return; // Ignore since this is just a touch bubbling up
    }
    e.preventDefault();
    rerender(true);
});

rerenderNewSeed.addEventListener('touchstart', function(e) {
    e.preventDefault();
    rerender(false);
});

rerenderOldSeed.addEventListener('touchstart', function(e) {
    e.preventDefault();
    rerender(true);
});

document.addEventListener('keydown', function(e) {
    if (e.which === 13 || e.keyIdentifier === 'Enter') {
        rerender(true);
    }
});

function rerender(useOldSeed) {
    var newQuery = {};
    var inputs = Array.prototype.slice.call(document.querySelectorAll('input'));
    inputs.forEach(function(input) {
        if (input.type === 'checkbox' && input.checked !== input.defaultChecked) {
            newQuery[input.name] = (input.checked ? 1 : 0);
        } else if (input.type !== 'checkbox' && input.value.replace(/^#/, "") !== input.defaultValue) {
            newQuery[input.name] = input.value.replace(/^#/, "");
        }
    });

    _.keys(query).forEach(function(key) {
        var input = document.querySelector('input[name="' + key + '"]');
        if (input === null) {
            // If there is no input corresponding to this key/value, then
            // add it.
            newQuery[key] = query[key];
        }
    });

    var newQueryString = qs.stringify(newQuery);
    // console.log('[literal-trees] New rendering query string', newQueryString);
    if (useOldSeed) {
        window.location.hash = seed;
        window.location.search = newQueryString;
    } else if (window.location.search.replace(/^\?/, "") === newQueryString) {
        window.location.hash = "";
        window.location.reload();
    } else {
        window.location.hash = "";
        window.location.search = newQueryString;
    }
}

function updateSlider($input, $slider) {
    // Assume we have jquery
    var $inner = $slider.find('.toggle-switch-inner');
    if ($input.is(":checked")) {
        $inner.css({
            left: 'initial',
            right: '3px',
            background: 'black',
            color:'white'
        });
        // $inner.text('True');
    } else {
        $inner.css({
            right: 'initial',
            left: '3px',
            background: 'white',
            color:'black'
        });
        // $inner.text('False');
    }
}

function updateInputValues(query) {
    _.keys(query).forEach(function(key) {
        var input = document.querySelector('input[name="' + key + '"]');
        if (input && input.type === 'checkbox') {
            input.checked = query[key] ? true : false;
        } else if (input) {
            input.value = query[key];
        }
    });
}

updateInputValues(query);

function addResource(url, cb) {
    var tag;
    cb = cb || function() {};
    if (/js$/.test(url)) {
        tag = document.createElement('script');
        tag.src = url;
        tag.onload = cb;
    } else if (/css$/.test(url)) {
        tag  = document.createElement('link');
        tag.type = 'text/css';
        tag.href = url;
        tag.rel = 'stylesheet';
        tag.onload = cb;
    }
    document.body.appendChild(tag);
}

function runAfterRendering() {
    addResource('bower_components/minicolors/jquery.minicolors.css');
    addResource('bower_components/jquery/dist/jquery.min.js', function() {
        // Should probably be using a library for this chaining.
        addResource('bower_components/minicolors/jquery.minicolors.min.js', function() {
            // Assert: jQuery is on the page, as is the mini colors CSS and
            // JS.

            // Initialize the mini colors plugin
            $('input.color').minicolors();

            $('input[type="checkbox"]').each(function() {
                var $input = $(this);
                var $slider = $('<div class="toggle-switch-outer"><div class="toggle-switch-inner"></div></div>');
                $input.hide();
                $slider.insertAfter($input);
                updateSlider($input, $slider);

                $slider.on('click', function() {
                    var props = {};
                    $input.click();
                    updateSlider($input, $slider);
                });
            });

        });
    });
}

if (query.norender) { return; }
var seed;
var w = new Worker('js/main.bundled.js?v=TIMESTAMP');
w.onmessage = function(e) {
    // console.log('[index.html] Got "' + e.data.event + '" message from worker');
    switch(e.data.event) {
        case 'log':
            LOG.log(e.data.msg);
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
            document.getElementById('persistant-link-container').style.visibility = "visible";
            var oldSeedRenderLink = document.getElementById('rerender-old-seed');
            var title = oldSeedRenderLink.getAttribute('title');
            oldSeedRenderLink.setAttribute('title', title + ' (' + seed + ').');
            break;
        case 'metrics':
            // (new Image()).src ='http://localhost:8800/metrics?' + e.data.value;
            // (new Image()).src = 'https://2dbjfwpz3h.execute-api.us-east-1.amazonaws.com/prod/testMe';
            break;
        case 'svg':
            timers.endTimer('SVG compute time');
            console.log('[literal-trees] svg document is ~' + Math.ceil(.75 * (e.data.value.length/1024)) + ' KB');
            if (query.svg) {
                // User explicitly asked for SVG only
                document.getElementById('paper').innerHTML = e.data.value;
                var style = document.createElement('style');
                // Manually center. This used to "just work" when we had the
                // width and height of the svg document set to 100%, but
                // Firefox has issues with that - it does not properly
                // rasterize an SVG document unless the document has
                // absolute width and height dimensions.
                var leftAdjustment = '#paper svg { margin-left:-' + (e.data.width/2) + 'px; }';
                style.innerHTML = leftAdjustment;
                document.head.appendChild(style);
            } else if (query.svgraw) {
                document.write(e.data.value);
            } else {
                // Else go through the rasterizing process to get a bitmap
                // image.
                timers.startTimer('Total client-side raster time');
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
                    timers.endTimer('SVG load time');
                    ctx.fillStyle = bgcolor;
                    ctx.fillRect(0, 0, Math.ceil(e.data.width), Math.ceil(e.data.height));
                    // Problems in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=700533
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
                        timers.endTimer('PNG load time');
                        timers.startTimer('PNG appended to DOM time');
                        LOG.log('Natural image width:', rasterImage.width);
                        paperEl.innerHTML = "";
                        paperEl.appendChild(container);
                        container.appendChild(rasterImage);
                        timers.endTimer('PNG appended to DOM time');
                        setTimeout(function() {
                            // Put this in a timeout so that the browser has
                            // a change to compute the correct layout and
                            // thus determine the correct width of the image
                            // needed in the media query we're about to add.
                            var mediaQuery = document.createElement('style');
                            var style = '@media screen and (max-width : ' + rasterImage.width + 'px) { #paper div img { position:absolute; bottom:0; } }';
                            LOG.log('Rendered image width:', rasterImage.width);
                            mediaQuery.innerHTML = style;
                            document.head.appendChild(mediaQuery);
                            timers.endTimer('Total client-side raster time');
                            // console.log('[literal-trees] First byte to loaded time:', (new Date()).valueOf() - window.lt_t0 + 'ms');
                            console.timeEnd('First byte to loaded time');
                        }, 1000);
                        runAfterRendering();
                    }
                    timers.startTimer('PNG load time');
                    var dataUrl = canvas.toDataURL();
                    rasterImage.src = dataUrl;
                    console.log('[literal-trees] rasterized image is ~' + Math.ceil(.75 * (dataUrl.length/1024)) + ' KB');
                }
                timers.startTimer('SVG load time');
                svgImage.src = 'data:image/svg+xml,' + escape(e.data.value);
            }
            break;
    }
};

LOG.log('window.innerWidth', window.innerWidth);
LOG.log('window.innerHeight', window.innerHeight);
LOG.log('document.documentElement.clientWidth', document.documentElement.clientWidth);
LOG.log('document.documentElement.clientHeight', document.documentElement.clientHeight);
LOG.log('window.screen.width', window.screen.width);
LOG.log('window.screen.height', window.screen.height);

timers.startTimer('SVG compute time');
w.postMessage({
    event: 'inputs',
    // Using clientWidth/Height instead of innerWidth/Height due to a
    // possible bug in iOS 9 Safari?
    // https://gist.github.com/baptistebriel/ae67afca884e21b5b425. Honestly
    // not entirely sure why I thought I needed innerWidth/Height in the
    // first place.
    paperWidth: document.documentElement.clientWidth, // window.innerWidth,
    paperHeight: document.documentElement.clientHeight, // window.innerHeight,
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
    circleradius: query.circleradius,
    margin: query.margin,
    showbranches: query.showbranches,
    sizingmethod: query.sizingmethod
});
