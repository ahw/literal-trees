var PAPER_WIDTH = document.getElementById("paper").offsetWidth;
var PAPER_HEIGHT = window.innerHeight - 16; // document.getElementById("paper").offsetHeight;
var Normal = Normal();
var Color = $c; // Comes from colors.js
var paper = Raphael("paper", PAPER_WIDTH, PAPER_HEIGHT);
var t0 = Date.now();

var LOG = new Logger({
    modules: "all",
    prefix: ""
});

// Performs a linear transformation of values in the domain to corresponding
// values in the range. Requires two values from each in order to compute a
// mapping function. These inputs should be two-element arrays. For example,
// If domain is [0, 10] and range is [20, 30] then this function will map
// input value 0 to output 20, input value 10 to output 30, and all other
// arbitrary input values accordingly.
var LinearTransform = function(domain, range, x) {
    // rise / run
    var slope = (range[1] - range[0]) / (domain[1] - domain[0]);
    // b = y - mx
    var intercept = range[0] - slope * domain[0];
    if (typeof x === "number") {
        // If a domain value was provided, return the transformed result
        return slope * x + intercept;
    } else {
        // If no domain value was provided, return a function
        return function(x) {
            return slope * x + intercept;
        }
    }
};

var rad = function(deg) {
    return Math.PI * deg / 180;
};

var path = function () {
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

var transform = path; // Alias to path. Both are just conveniences.

var pad = function(n) {
    s = "";
    while (n > 0) {
        s += "  ";
        n--;
    }
    return s;
};

var branch = function (args) {
    var x = args.x;
    var y = args.y;
    var depth = args.depth || 0;
    var maxDepth = args.maxDepth;
    var angleRange = Normal.sample() * 5 + 65;
    var referenceAngle = args.referenceAngle;

    LOG.log(pad(depth) + "Branching at (" + x + "," + y + "). Depth=" + depth + ", maxDepth=" + maxDepth);

    if (depth === maxDepth) {
        return "";
    }

    // Transform the depth value to something on the range [3, 5].
    var numBranches = Math.floor(Normal.sample() * 0.5 + LinearTransform([0, maxDepth], [3, 8], depth));
    LOG.log(pad(depth) + "Number of branches:", numBranches);
    var localPathString = "";
    for (var i = 0; i < numBranches; i++) {
        var relativeAngle = Normal.sample() * 5 - (angleRange / 2) + i * angleRange / (numBranches - 1);
        var absoluteAngle = referenceAngle + relativeAngle;
        var length = Normal.sample() * 10 + LinearTransform([0, maxDepth], [10, 0], depth) * LinearTransform([0, 90], [0, 10], Math.abs(absoluteAngle));
        if (length <= 0) {
            // TODO: Use seed values to see if there is any actual difference in returning early here.
            console.log("Returning early because branch length was " + length + " at depth " + depth);
            return;
        }
        var xOffset = length * Math.cos(rad(absoluteAngle));
        var yOffset = length * Math.sin(rad(absoluteAngle));
        // RGB(147, 113, 68)
        var red   = Math.floor(LinearTransform([0, maxDepth], [204, 74], depth));
        var green = Math.floor(LinearTransform([0, maxDepth], [194, 46], depth));
        var blue  = Math.floor(LinearTransform([0, maxDepth], [182, 2], depth));
        var color = Color.rgb2hex(red, green, blue);
        LOG.debug(pad(depth) + "Color at depth " + depth + " is " + color);
        paper
            .path(path('M', x, y, 'l', xOffset, yOffset))
            .attr("stroke", color);
        branch({
            x: x + xOffset,
            y: y + yOffset,
            depth: depth + 1,
            maxDepth: maxDepth,
            angleRange: angleRange, // TODO: Vary this?
            referenceAngle: referenceAngle + relativeAngle
        });
    }
    return localPathString;
};

var trunk = function (args) {
    var x0 = args.x0;
    var y0 = args.y0;
    var x1 = args.x1;
    var y1 = args.y1;
    var height = args.height;
    paper
        .path(path('M', x0, y0, 'L', x1, y1))
        .attr("stroke", "#cccccc");
};

var trunkStartX = PAPER_WIDTH / 2;
var trunkStartY = PAPER_HEIGHT;
var trunkEndX = PAPER_WIDTH / 2;
var trunkEndY = PAPER_HEIGHT - (PAPER_HEIGHT * 0.3);

trunk({
    x0: trunkStartX,
    y0: trunkStartY,
    x1: trunkEndX,
    y1: trunkEndY
});

var result = branch({
    x: trunkEndX,
    y: trunkEndY,
    maxDepth: 6,
    angleRange: 70,
    referenceAngle: -90
});

if (result === -1) {
    $("#paper").html("tree died.");
}

console.log(result);
paper.path(result);

var elapsed = Date.now() - t0;
document.getElementById("time").innerHTML = elapsed;
// document.body.style.backgroundColor = "#DEF5FF";
// document.body.style.backgroundColor = "#ccc";
var t1 = Date.now();
LOG.log('Rendering time (ms)', t1 - t0);
// var s = paper.rect(100, 100, 20, 20).attr({fill: 'blue', 'stroke-width': 0});
// var r = paper.rect(100, 100, 20, 20);
// var t = r.transform("t100,100r30,100,100s2,2,100,100r45s1.5");
// LOG.log('transform t', t);
