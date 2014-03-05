/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "module_name". Otherwise, call to
 * this logger return nothing.
 */
var Logger = function(args) {

    var logger = this;
    logger.module = args.module;
    logger.prefix = args.prefix + ':';
    logger.padding = args.padding || '';

    logger.isEnabled = function() {
        // Matches log=mod1;mod2;mod3
        var isEnabledRegex = new RegExp("\\?.*log=[^&]*(" + logger.module + "|all)");
        // Matches log=-mod1;-mod2;-mod3
        var isNotEnabledRegex = new RegExp("\\?.*log=[^&]*-" + logger.module);
        return (isEnabledRegex.test(window.location.search)
            && !isNotEnabledRegex.test(window.location.search));
    };

    logger.meetsThreshold = function(inputLevel) {
        var thresholdLevel = logger.getLevel();
        return logger.levels[inputLevel] >= logger.levels[thresholdLevel];
    };

    logger.getLevel = function() {
        var matches = window.location.search.match(/level=(debug|info|warn|error)/);
        if (matches) {
            return matches[1];
        } else {
            return 'debug'; // Default threshold is debug.
        }
    };

    logger.levels = {
        debug : 0,
        info : 1,
        warn : 2,
        error : 3
    };

    logger.colors = {
        debug : 'color:gray',
        info  : 'color:blue',
        warn  : 'color:black; background:yellow',
        error : 'color:red; text-decoration:underline'
    };

    logger.printMessage = function(level, msg, obj) {
        if (!logger.isEnabled() || !logger.meetsThreshold(level))
            return;

        var augmentedMsg = sprintf('%s%5s - %s %s', logger.padding, level, logger.prefix, msg);
        if (typeof obj != 'undefined')
            console[level]('%c' + augmentedMsg, logger.colors[level], obj);
        else
            console[level]('%c' + augmentedMsg, logger.colors[level]);
    };

    logger.debug = function(msg, obj) {
        logger.printMessage('debug', msg, obj);
    };

    logger.info = function(msg, obj) {
        logger.printMessage('info', msg, obj);
    };

    // Alias info to log.
    logger.log = logger.info;

    logger.warn = function(msg, obj) {
        logger.printMessage('warn', msg, obj);
    };

    logger.error = function(msg, obj) {
        logger.printMessage('error', msg, obj);
    };

};