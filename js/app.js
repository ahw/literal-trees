var qs = require('querystring');
var download = require('./download');

var query = qs.parse(window.location.search.substr(1));
document.getElementById("paper").style.background = query.bgcolor || 'transparent';
document.getElementById("loading-message").style.color = query.color || 'black';

var seed;
var w = new Worker('js/main.bundled.js');
w.onmessage = function(e) {
    // console.log('[index.html] Got "' + e.data.event + '" message from worker');
    switch(e.data.event) {
        case 'seed':
            seed = e.data.value;
            console.log('Seed value is', seed);
            var link = document.getElementById("persistant-link");
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
                console.log('Got click on download-link');
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
    windx: query.windx,
    windy: query.windy,
    ta: query.ta,
    trunkheight: query.trunkheight,
    color: query.color,
    bgcolor: query.bgcolor,
    depth: query.depth,
    arm: query.arm,
    arv: query.arv,
    co: query.c,
    bat: query.ba,
    bld: query.bld,
    co: query.co,
    ce: query.ce,
    showbranches : !(query.showbranches == 0)
});
