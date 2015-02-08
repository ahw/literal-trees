// Start the main app logic
var wait = 10;
setTimeout(function() {
    requirejs(['app/tree'], function(Tree) {
            var t = new Tree();

            t.start();
    });
}, wait);
console.log('Will build a tree in ' + wait + 'ms');
