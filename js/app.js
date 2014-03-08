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
        'underscore': {
            exports: '_'
        },
        'raphael': {
            exports: 'Raphael'
        },
        'colors': {
            exports: 'Colors'
        }
    }
});

// Start the main app logic
requirejs(['raphael',
    'jquery',
    'underscore',
    'colors',
    'logger',
    'app/trees'
    ], function(Raphael, $, _, Colors, Logger) {
        var LOG = new Logger({
            module: "app"
        });
        LOG.debug("App has started.");
});
