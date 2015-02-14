// BEGIN:dev
// importScripts("/js/lib/require.js");
// importScripts("/js/require-config.js");
// END:dev

// Start the main app logic
var Tree = require('./app/tree');
self.onmessage = function(e) {
    if (e.data.event === 'dimensions') {
        var t = new Tree({
            width: e.data.width,
            height: e.data.height
        });

        t.start(function(svg) {
            self.postMessage({event: 'svg', value: svg});
        });
    }
}
