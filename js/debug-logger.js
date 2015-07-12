function DebugLogger() {
    this.isEnabled = /debug=1/.test(window.location.search);
    if (this.isEnabled) {
        this.console = window.console;
    } else {
        var NO_OP = function() {};
        this.console = {
            debug: NO_OP,
            log: NO_OP,
            info: NO_OP,
            warn: NO_OP,
            error: NO_OP
        }
    }
}

DebugLogger.prototype.log = function() {
    var args = Array.prototype.slice.call(arguments);
    this.console.log.apply(this.console, ['[literal-trees]'].concat(args));

    if (this.isEnabled) {
        var str = args.join(' ');
        if (document.getElementById('logging')) {
            var logging = document.getElementById('logging');
            logging.innerHTML = logging.innerHTML + "\n" + str;
        } else {
            var logging = document.createElement('pre');
            logging.id = 'logging';
            logging.innerHTML = str;
            logging.style.position = 'fixed';
            logging.style.background = 'white';
            logging.style['z-index'] = 10;
            logging.style.borderRadius = 0;
            logging.style.opacity = 0.9;
            logging.style.border = 'none';
            document.body.insertBefore(logging, document.getElementById('paper'));
        }
    }
};

module.exports = DebugLogger;
