/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "module_name". Otherwise, call to
 * this logger return nothing.
 */
throw new Error('here is an error');
function Logger(args) {
    var logger = this;
    var args = args || {};
    logger.module = args.module;
    logger.prefix = args.prefix ? args.prefix : args.module + ": ";
    logger.padding = args.padding || '';
    logger.alwaysEnabled = args.alwaysEnabled;
    logger.alwaysDisabled = args.alwaysDisabled;
}

// Helper function to implement poor person's sprintf("%7s", "hi"). Don't really feel like including the entire sprintf module right now.
function format(string, length) {
    for (var i = 0; i < length - string.length; i++) {
        string += " ";
    }
    return string;
}

Logger.prototype.isEnabled = function () {
    var logger = this;
    // Matches log=mod1;mod2;mod3
    var isEnabledRegex = new RegExp("\\?.*log=[^&]*(" + logger.module + "|all)");
    // Matches log=-mod1;-mod2;-mod3
    var isDisabledRegex = new RegExp("\\?.*log=[^&]*-" + logger.module);

    var isEnabled = isEnabledRegex.test(window.location.search);
    var isDisabled = isDisabledRegex.test(window.location.search);
    var isAlwaysEnabled = logger.alwaysEnabled;
    var isAlwaysDisabled = logger.alwaysDisabled; // TODO: Implement.

    return isAlwaysEnabled || (isEnabled && !isDisabled);
};

Logger.prototype.meetsThreshold = function (inputLevel) {
    var logger = this;
    var thresholdLevel = logger.getLevel();
    return logger.levels[inputLevel] >= logger.levels[thresholdLevel];
};

Logger.prototype.getLevel = function () {
    var matches = window.location.search.match(/level=(debug|info|warn|error)/);
    if (matches) {
        return matches[1];
    } else {
        return 'debug'; // Default threshold is debug.
    }
};

Logger.prototype.levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

Logger.prototype.colors = {
    debug: 'color:gray',
    info: 'color:blue',
    warn: 'color:black; background:yellow',
    error: 'color:red; text-decoration:underline'
};

Logger.prototype.printMessage = function (level, msg, obj) {
    var logger = this;
    if (!logger.isEnabled() || !logger.meetsThreshold(level)) {
        return;
    }

    // var augmentedMsg = sprintf('%s%5s - %s %s', logger.padding, level, logger.prefix, msg);
    var augmentedMsg = logger.padding + format(level, 5) + " - " + logger.prefix + msg;
    if (typeof obj != 'undefined') {
        console[level]('%c' + augmentedMsg, logger.colors[level], obj);
    }
    else {
        console[level]('%c' + augmentedMsg, logger.colors[level]);
    }
};

Logger.prototype.debug = function (msg, obj) {
    var logger = this;
    logger.printMessage('debug', msg, obj);
};

Logger.prototype.info = function (msg, obj) {
    var logger = this;
    logger.printMessage('info', msg, obj);
};

// Alias info to log.
Logger.prototype.log = Logger.prototype.info;

Logger.prototype.warn = function (msg, obj) {
    var logger = this;
    logger.printMessage('warn', msg, obj);
};

Logger.prototype.error = function (msg, obj) {
    var logger = this;
    logger.printMessage('error', msg, obj);
};

// Do all the weird JavaScript exporting logic. Tries to handle the Node case,
// the browser global case, and the requirejs-style AMD case.
if (typeof module === "object" && module && typeof module.exports === "object") {
    // Expose as Node.js module.
    window = {
        location: {
            search: "?log=all"
        }
    };
    console.debug = console.log;
    module.exports = Logger;
} else {
    // Register as an AMD module.
    if (typeof define === "function" && define.amd) {
        define(function () { return Logger; });
    }
}

// Export as a browser window global for old times sake.
if (typeof window === "object" && typeof window.document === "object") {
    window.Logger = Logger;
}
