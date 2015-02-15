// BEGIN:dev
// importScripts("/js/lib/require.js");
// importScripts("/js/require-config.js");
// END:dev

// Start the main app logic
var Tree = require('./tree');
self.onmessage = function(e) {
    if (e.data.event === 'inputs') {
        var t = new Tree({
            width: e.data.width,
            height: e.data.height,
            seed: e.data.seed // Will be "" if one was not supplied
        });
        console.log('here is something');

        t.start(function(svg) {
            self.postMessage({event: 'svg', value: svg});
        });
    }
}
