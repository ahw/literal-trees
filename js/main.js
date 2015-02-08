// BEGIN:dev
// importScripts("/js/lib/require.js");
// importScripts("/js/require-config.js");
// END:dev

// Start the main app logic
var Tree = require('./app/tree');
var wait = 1;
setTimeout(function() {
    var t = new Tree();
    t.start();
}, wait);
console.log('Will build a tree in ' + wait + 'ms');
