var _ = require('underscore');

function Path(d) {
    this.d = d;
    return this;
}

Path.prototype.attr = function(map) {
    var e = this;
    _.keys(map).forEach(function(key) {
        e[key] = map[key];
    });
    return e;
};

Path.prototype.toString = function() {
    var path = this;
    var attrs = _.map(_.keys(path), function(key) {
        return key + '="' + path[key] + '"';
    }).join(" ");
    var str = '<path ' + attrs + '/>';
    return str;
};

function Paper(selector, width, height) {
    this.width = width || 0;
    this.height = height || 0;
    this.container = selector;
    this.paths = [];
    this.xmlns = 'http://www.w3.org/2000/svg';
    this.version = '1.1';
    this.viewBox = null;
}

Paper.prototype.path = function(str, options) {
    options = options || {};
    var p = new Path(str);
    if (options.top) {
        this.paths.push(p);
    } else if (options.bottom) {
        this.paths.unshift(p);
    } else {
        this.paths.push(p);
    }
    return p;
};

Paper.prototype.circle = function() {
    console.warn('Paper.circle() is just a pass-through');
    return this;
}

Paper.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    return this;
};

Paper.prototype.toString = function() {
    var viewBox = this.viewBox ? 'viewBox="' + this.viewBox + '"' : "";
    var svg = '<svg version="' + this.version + '" xmlns="' + this.xmlns + '" width="' + this.width + '" height="' + this.height + '" ' + viewBox + ' preserveAspectRatio="xMidYMid meet">';
    svg += _.map(this.paths, function(path) {
        return path.toString();
    }).join('\n');
    svg  += '</svg>';
    return svg;
};

Paper.prototype.getBoundingBoxSize = function() {
    var bottom = 0;
    var right = 0;
    // Assume the DOM structure is #container > svg > [path, ...]
    _.each(this.container.children[0].children, function(path) {
        // var rect = path.getClientBoundingBox();
        var rect = path.getBBox();
        right = _.max([right, rect.x + rect.width]);
        bottom = _.max([bottom, rect.y + rect.height]);
    });

    return {
        height: bottom,
        width: right
    };
};

Paper.prototype.setViewBox = function(x, y, width, height) {
    // Assumed that if you want units attached to width and height you'll do
    // the string concatenation yourself (e.g., 10px).
    this.viewBox = x + " " + y + " " + width + " " + height;
};

function Raphael(selector, width, height) {
    return new Paper(selector, width, height);
}

module.exports = Raphael;
