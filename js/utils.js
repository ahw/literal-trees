/**
 * Performs a linear transformation of values in the domain to corresponding
 * values in the range. Requires two values from each in order to compute a
 * mapping function. These inputs should be two-element arrays. For example,
 * If domain is [0, 10] and range is [20, 30] then this function will map
 * input value 0 to output 20, input value 10 to output 30, and all other
 * arbitrary input values accordingly.
 *
 * @param domain
 * @param range
 * @param x
 * @returns {*}
 * @constructor
 */
module.exports.LinearTransform = function (domain, range, x) {
    // rise / run
    var slope = (range[1] - range[0]) / (domain[1] - domain[0]);
    // b = y - mx
    var intercept = range[0] - slope * domain[0];
    if (typeof x === "number") {
        // If a domain value was provided, return the transformed result
        return slope * x + intercept;
    } else {
        // If no domain value was provided, return a function
        return function (x) {
            return slope * x + intercept;
        }
    }
};

module.exports.rad = function (deg) {
    return Math.PI * deg / 180;
};

module.exports.path = function () {
    var previousArgWasNumber = false;
    var pathString = "";
    Array.prototype.slice.call(arguments, 0).forEach(function (arg, index) {
        if (typeof arg === 'number' && previousArgWasNumber) {
            pathString += ","; // Assume all numbers are comma separated
        }

        pathString += arg;
        previousArgWasNumber = (typeof arg === 'number');
    });
    return pathString;
};

/**
 * Takes a decimal value in the range [0, 255] and outputs a two-digit hex string representation.
 *
 * @param n
 * @returns {string}
 */
module.exports.decimal2hex = function (n) {
    var hex = ((n < 10) ? "0" : "") + n.toString(16);
    return (hex.length === 1) ? "0" + hex : hex;
};

/**
 * Takes three RGB values each in the range [0, 255] and outputs the CSS hex string representation.
 *
 * @param r
 * @param g
 * @param b
 */
module.exports.rgb2hex = function (r, g, b) {
    return "#" + module.exports.decimal2hex(r) + module.exports.decimal2hex(g) + module.exports.decimal2hex(b);
};

module.exports.applyStyles = function(el, styles, options) {
    options = options || {};
    Object.keys(styles).forEach(function(property) {
        el.style[property] = styles[property];
        if (options.prefix) {
            if (typeof options.prefix !== 'object') {
                options.prefix = ['webkit', 'moz'];
            }
            options.prefix.forEach(function(prefix) {
                el.style['-' + prefix + '-' + property] = styles[property];
            });
        }
    });
};
