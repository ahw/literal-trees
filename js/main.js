// Start the main app logic
requirejs(['app/tree'], function(Tree) {
        var t = new Tree();

        t.start(function() {
            requirejs(['app/btf']);
        });
});
