// Start the main app logic
var Tree = require('./tree');
self.onmessage = function(e) {
    if (e.data.event === 'inputs') {
        var t = new Tree(e.data);

        t.start(function(svg, width, height) {
            self.postMessage({event: 'svg', width: width, height: height, value: svg});
        });
    }
}
