var qs = require('querystring');
var w = new Worker('js/main.bundled.js');
w.onmessage = function(e) {
    // console.log('[index.html] Got "' + e.data.event + '" message from worker');
    switch(e.data.event) {
        case 'seed':
            console.log('[index.html] seed value is', e.data.value);
            var link = document.getElementById("persistant-link");
            // Add /literal-trees/ path part to work on github
            var url = window.location.origin + '/literal-trees/v/LITERAL_TREES_VERSION/' + window.location.search + '#' + e.data.value;
            link.href = url
            link.innerHTML = url
            document.getElementById("persistant-link-container").style.visibility = "visible";
            break;
        case 'metrics':
            // (new Image()).src ='http://localhost:8800/metrics?' + e.data.value;
            break;
        case 'svg':
            // document.getElementById('loading-message').style.display = 'none';
            // var html = document.getElementById("paper").innerHTML;
            document.getElementById("paper").innerHTML = e.data.value;
            document.getElementById("download-link").setAttribute('href', "data:text/svg," + e.data.value);
            break;
    }
};

var query = qs.parse(window.location.search.substr(1));
w.postMessage({
    event: 'inputs',
    width: window.innerWidth,
    height: window.innerHeight,
    seed: window.location.hash.substr(1), // Always returns "" or the actual hash
    windx: query.windx,
    windy: query.windy,
    ta: query.ta,
    trunkheightratio: query.trunkheightratio,
    color: query.color,
    bgcolor: query.bgcolor,
    depth: query.depth,
    arm: query.arm,
    arv: query.arv,
    co: query.c,
    bat: query.ba,
    bld: query.bld,
    co: query.co,
    ce: query.ce
});

// var paper = document.getElementById("paper");
// var svg = paper.getElementsByTagName("svg")[0];
// paper.style.padding = 0;
// paper.style.backgroundColor = tree.BACKGROUND_COLOR;

// document.getElementById("loading-message").remove();
// LOG.debug("Removed loading elements");
// console.log("Persistant URL:", tree.PERSISTANT_LINK);


// Set the hash.
// if (window.location.search.indexOf("mode=dev") < 0) {
//     // TODO: Put this back;
//     // window.location.hash = seed;
//     tree.PERSISTANT_LINK = window.location.origin + "/v/LITERAL_TREES_VERSION/" + window.location.search + "#" + tree.seed;
// }
