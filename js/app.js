requirejs.config({
    // By default load any module ids from js/lib
    baseUrl: 'js/lib',

    // Except, if the module id starts with "app", load it from the js/app
    // directory. The paths config is relative to the baseUrl, and never
    // includes a ".js" extension since the paths config could be for a
    // directory.
    paths: {
        app: '../app'
    },

    shim: {
        'raphael': {
            exports: 'Raphael'
        }
    }
});

// Start the main app logic
requirejs(['logger', 'app/tree'], function(Logger, Tree) {
        var LOG = new Logger({
            module: "app"
        });
        LOG.debug("App has started.");
        var t = new Tree();

        t.on('done', function() {
            console.log('Tree has finished');
            requirejs(['app/btf'], function() {
            });
        });

        t.start();
});
