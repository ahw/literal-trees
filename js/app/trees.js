requirejs(['box-muller', 'logger', 'raphael', 'seedrandom', 'qs'], function (Normal, Logger, Raphael, SeedRandom, qs) {

    function setup() {
        document.getElementById("below-paper").style.height = window.innerHeight + "px";
    }
    setup();

    var LOG = new Logger({
        module: "trees"
    });

    var params = qs.parse(window.location.search);

    var PAPER_WIDTH = document.getElementById("paper").offsetWidth;
    var PAPER_HEIGHT = window.innerHeight;
    var TREE_MIN_X = Infinity; // Left-most branch tip of tree. Gets updated as tree is built.
    var TREE_MAX_X = 0; // Right-most branch tip of tree. Gets updated as tree is built.
    var TREE_MIN_Y = Infinity; // Remember y-axis is reversed.
    var TREE_MAX_Y = 0; // TODO: Where is this used?
    var paper = Raphael("paper", PAPER_WIDTH, PAPER_HEIGHT);
    var t0 = Date.now();
    var WINDX = params.windx || 0;
    var WINDY = params.windy || 0;
    var TRUNK_ANGLE = params.ta || 90;
    var COLOR = params.color || "black";
    var BACKGROUND_COLOR = params.bgcolor || "none";
    var MAX_DEPTH = params.depth || 6;
    var ANGLE_RANGE_MEAN = params.ar || 65;
    var ANGLE_RANGE_VARIANCE = params.arv || 5; // TODO: This will have to check for isNumber.
    var CIRCLE_ORIGINS = params.co;
    var BRANCH_AT_TIP = params.bat;

    LOG.debug("Parsed query string", qs.parse(window.location.search));
    LOG.debug("Using COLOR", COLOR);

    var seed = window.location.hash.replace(/#/, "");
    if (window.location.hash === "") {
        // If we haven't been given a seed in the hash then call
        // Math.seedrandom to get a random seed, then base64 encode it, then
        // remove non-URL-friendly characters, then strip off the first 16
        // characters. Basically, we just want a manageable-size seed value that
        // is easily placed in the hash of the URL.
        seed = window.btoa(Math.seedrandom()).replace(/\W/g, "").substr(0, 16);
        LOG.info("Generating a new random seed", seed);
    }
    LOG.debug("Using seed", seed);

    // Set the hash.
    if (window.location.search.indexOf("mode=dev") < 0) {
        // TODO: Put this back;
        // window.location.hash = seed;
        console.log("Persistant URL:", window.location.origin + "/v/LITERAL_TREES_VERSION/" + window.location.search + "#" + seed);
    }

    // Now call Math.seedrandom again, this time with the seed we put in the
    // hash. All further calls to Math.random() are now deterministic.
    Math.seedrandom(seed);

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
    var decimal2hex = function (n) {
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
        var maxDepth = args.maxDepth;
        // TODO: Vary angle range as a function of depth?

        var queue = [{x: args.x, y: args.y, depth: 0, referenceAngle: args.referenceAngle, previousLength: 30}];
        while (queue.length) {
            var point = queue.shift();

            if (point.depth === maxDepth) {
                continue;
            }

            var angleRange = Normal.sample() * ANGLE_RANGE_VARIANCE + ANGLE_RANGE_MEAN;
            var numBranches = Math.floor(Normal.sample() * 0.5 + LinearTransform([0, maxDepth], [4, 8], point.depth));

            var relativeAngles = [];
            var minRelativeAngle = Infinity;
            for (var i = 0; i < numBranches; i++) {
                // TODO: Explain this.
                var relativeAngle = Normal.sample() * 5 - (angleRange / 2) + i * angleRange / (numBranches - 1);
                if (Math.abs(relativeAngle) < Math.abs(minRelativeAngle)) {
                    minRelativeAngle = relativeAngle;
                }
                relativeAngles.push(relativeAngle);
            }

            for (var i = 0; i < numBranches; i++) {
                var relativeAngle = relativeAngles[i];
                var absoluteAngle = point.referenceAngle + relativeAngle;
                var length = Normal.sample() * 10 + LinearTransform([0, maxDepth], [75, 0], point.depth);
                if (length <= 0) {
                    continue;
                }
                var branchOrigin = {x: point.x, y: point.y};

                if (!BRANCH_AT_TIP && relativeAngle != minRelativeAngle) {
                    var branchOriginOffset = LinearTransform([0, 1], [0, point.previousLength / 3], Math.random());
                    var xStartOffset = branchOriginOffset * Math.cos(rad(point.referenceAngle));
                    var yStartOffset = branchOriginOffset * Math.sin(rad(point.referenceAngle));
                    branchOrigin.x = point.x - xStartOffset;
                    branchOrigin.y = point.y + yStartOffset;
                }

                if (CIRCLE_ORIGINS) {
                    paper.circle(branchOrigin.x, branchOrigin.y, 2).attr({stroke: "red", fill: "none"});
                }

                var xOffset = length * Math.cos(rad(absoluteAngle));
                var yOffset = -length * Math.sin(rad(absoluteAngle));

                // Keep track of the outermost branch tips
                if (branchOrigin.x + xOffset < TREE_MIN_X) TREE_MIN_X = branchOrigin.x + xOffset;
                if (branchOrigin.x + xOffset > TREE_MAX_X) TREE_MAX_X = branchOrigin.x + xOffset;
                if (branchOrigin.y + yOffset < TREE_MIN_Y) TREE_MIN_Y = branchOrigin.y + yOffset;
                if (branchOrigin.y + yOffset > TREE_MAX_Y) TREE_MAX_Y = branchOrigin.y + yOffset;
                // RGB(147, 113, 68)

                // Pink: 255, 0, 71
                // var red = Math.floor(LinearTransform([0, maxDepth], [204, 74], point.depth));
                // var green = Math.floor(LinearTransform([0, maxDepth], [194, 46], point.depth));
                // var blue = Math.floor(LinearTransform([0, maxDepth], [182, 2], point.depth));
                // var color = rgb2hex(red, green, blue);
                var color = COLOR;

                // var gray = 0; // Math.floor(LinearTransform([0, maxDepth], [150, 0], depth));

                // Draw the branch.
                paper.path(path('M', branchOrigin.x, branchOrigin.y, 'l', xOffset, yOffset)).attr("stroke", color);

                queue.push({
                    x: branchOrigin.x + xOffset,
                    y: branchOrigin.y + yOffset,
                    depth: point.depth + 1,
                    referenceAngle: point.referenceAngle + relativeAngle,
                    previousLength: length
                });
            }
        }
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
        color: COLOR // rgb2hex(204, 194, 182)
    });

    branch({
        x: trunkEndX,
        y: trunkEndY,
        maxDepth: MAX_DEPTH,
        referenceAngle: TRUNK_ANGLE
    });

    var elapsed = Date.now() - t0;
    LOG.debug("Rendering time", elapsed);

    // paper.rect(TREE_MIN_X, TREE_MIN_Y, TREE_MAX_X - TREE_MIN_X, PAPER_HEIGHT - TREE_MIN_Y).attr("stroke", "lightgray");
    // paper.rect(0, 0, PAPER_WIDTH, PAPER_HEIGHT).attr("stroke", "lightgray");
    var xMargin = 0.05 * (TREE_MAX_X - TREE_MIN_X);
    var yMargin = 0.05 * (PAPER_HEIGHT - TREE_MIN_Y);
    paper.setViewBox(TREE_MIN_X - xMargin, TREE_MIN_Y - yMargin, (TREE_MAX_X - TREE_MIN_X) + 2 * xMargin , (PAPER_HEIGHT - TREE_MIN_Y) + yMargin, true);
    document.getElementById("paper").style.padding = 0;
    document.getElementById("paper").getElementsByTagName("svg")[0].setAttribute("preserveAspectRatio", 'xMidYMax');

    document.getElementById("loading-message").remove();
    LOG.debug("Removed loading elements");
});
