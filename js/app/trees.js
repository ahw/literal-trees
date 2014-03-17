requirejs(['box-muller', 'logger', 'raphael', 'seedrandom', 'qs'], function (Normal, Logger, Raphael, SeedRandom, qs) {

    var LOG = new Logger({
        module: "trees"
    });

    var RAND_LOG = new Logger({
        module: "rand"
    });


    var seed = window.location.hash.replace(/#/, "");
    if (window.location.hash === "") {
        // If we haven't been given a seed in the hash then call
        // Math.seedrandom to get a random seed, then base64 encode it, then
        // remove non-URL-friendly characters, then strip off the first 16
        // characters. Basically, we just want a manageable-size seed value that
        // is easily placed in the hash of the URL.
        seed = window.btoa(Math.seedrandom()).replace(/\W/g, "").substr(0, 16);
        RAND_LOG.info("Generating a new random seed", seed);
    }
    RAND_LOG.debug("Using seed", seed);

    // Set the hash.
    if (window.location.search.indexOf("mode=dev") < 0) {
        // TODO: Put this back;
        // window.location.hash = seed;
        console.log("Persistant URL:", window.location.origin + "/v/LITERAL_TREES_VERSION/" + window.location.search + "#" + seed);
    }

    // Now call Math.seedrandom again, this time with the seed we put in the
    // hash. All further calls to Math.random() are now deterministic.
    Math.seedrandom(seed);

    var PAPER_WIDTH = document.getElementById("paper").offsetWidth;
    var PAPER_HEIGHT = window.innerHeight;
    var TREE_MIN_X = Infinity;
    var TREE_MAX_X = 0;
    var TREE_MIN_Y = Infinity; // Remember y-axis is reversed.
    var paper = Raphael("paper", PAPER_WIDTH, PAPER_HEIGHT);
    var t0 = Date.now();
    var params = qs.parse(window.location.search);
    var WINDX = params.windx || 0;
    var WINDY = params.windy || 0;
    var TRUNK_ANGLE = params.ta || -90;
    var COLOR = params.color || "black";
    var BACKGROUND_COLOR = params.bgcolor || "none";
    var MAX_DEPTH = params.depth || 6;

    LOG.debug("Parsed query string", qs.parse(window.location.search));
    LOG.debug("Using COLOR", COLOR);

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
    var LinearTransform = function (domain, range, x) {
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

    var rad = function (deg) {
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

    /**
     * Takes a decimal value in the range [0, 255] and outputs a two-digit hex string representation.
     *
     * @param n
     * @returns {string}
     */
    decimal2hex = function (n) {
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
    var rgb2hex = function (r, g, b) {
        return "#" + decimal2hex(r) + decimal2hex(g) + decimal2hex(b);
    };

    var branch = function (args) {
        var x = args.x;
        var y = args.y;
        var depth = args.depth || 0;
        var maxDepth = args.maxDepth;
        var angleRange = Normal.sample() * 5 + 65;
        var referenceAngle = args.referenceAngle;

        if (depth === maxDepth) {
            return "";
        }

        // Transform the depth value to something on the range [3, 5].
        var numBranches = Math.floor(Normal.sample() * 0.5 + LinearTransform([0, maxDepth], [4, 8], depth));
        var localPathString = "";
        for (var i = 0; i < numBranches; i++) {
            var relativeAngle = Normal.sample() * 5 - (angleRange / 2) + i * angleRange / (numBranches - 1);
            var absoluteAngle = referenceAngle + relativeAngle;
            var length = Normal.sample() * 10 + LinearTransform([0, maxDepth], [75, 0], depth); // * LinearTransform([0, 90], [10, 0], Math.abs(relativeAngle));
            if (length <= 0) {
                return;
            }
            var xOffset = length * Math.cos(rad(absoluteAngle));
            var yOffset = length * Math.sin(rad(absoluteAngle));
            // RGB(147, 113, 68)
            // var red = Math.floor(LinearTransform([0, maxDepth], [204, 74], depth));
            // var green = Math.floor(LinearTransform([0, maxDepth], [194, 46], depth));
            // var blue = Math.floor(LinearTransform([0, maxDepth], [182, 2], depth));
            var gray = 0; // Math.floor(LinearTransform([0, maxDepth], [150, 0], depth));
            // var color = rgb2hex(gray, gray, gray);
            paper.path(path('M', x, y, 'l', xOffset, yOffset)).attr("stroke", COLOR);
            branch({
                x: x + xOffset,
                y: y + yOffset,
                depth: depth + 1,
                maxDepth: maxDepth,
                angleRange: angleRange, // TODO: Vary this?
                referenceAngle: referenceAngle + relativeAngle
            });

            // Keep track of the outermost branch tips
            if (x + xOffset < TREE_MIN_X) {
                TREE_MIN_X = x + xOffset;
            }

            if (x + xOffset > TREE_MAX_X) {
                TREE_MAX_X = x + xOffset;
            }

            if (y + yOffset < TREE_MIN_Y) {
                TREE_MIN_Y = y + yOffset;
            }
        }
        return localPathString;
    };

    var trunk = function (args) {
        var x0 = args.x0;
        var y0 = args.y0;
        var x1 = args.x1;
        var y1 = args.y1;
        var height = args.height;
        paper.path(path('M', x0, y0, 'L', x1, y1)).attr("stroke", args.color);
    };

    var trunkStartX = PAPER_WIDTH / 2;
    var trunkStartY = PAPER_HEIGHT;
    var trunkEndX = PAPER_WIDTH / 2;
    var trunkEndY = PAPER_HEIGHT - (PAPER_HEIGHT * 0.3);

    trunk({
        x0: trunkStartX,
        y0: trunkStartY,
        x1: trunkEndX,
        y1: trunkEndY,
        color: COLOR
    });

    var result = branch({
        x: trunkEndX,
        y: trunkEndY,
        maxDepth: MAX_DEPTH,
        angleRange: 70,
        referenceAngle: -90
    });

    if (result === -1) {
        $("#paper").html("tree died.");
    }

    var elapsed = Date.now() - t0;
    LOG.debug("Rendering time", elapsed);

    // paper.rect(TREE_MIN_X, TREE_MIN_Y, TREE_MAX_X - TREE_MIN_X, PAPER_HEIGHT - TREE_MIN_Y).attr("stroke", "lightgray");
    // paper.rect(0, 0, PAPER_WIDTH, PAPER_HEIGHT).attr("stroke", "lightgray");
    var xMargin = 0.05 * (TREE_MAX_X - TREE_MIN_X);
    var yMargin = 0.05 * (PAPER_HEIGHT - TREE_MIN_Y);
    paper.setViewBox(TREE_MIN_X - xMargin, TREE_MIN_Y - yMargin, (TREE_MAX_X - TREE_MIN_X) + 2 * xMargin , (PAPER_HEIGHT - TREE_MIN_Y) + yMargin, true);
    document.getElementById("paper").getElementsByTagName("svg")[0].setAttribute("preserveAspectRatio", 'xMidYMax');

    document.getElementById("loading-message").remove();
    LOG.debug("Removed loading elements");
});
