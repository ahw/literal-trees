var Normal = require('box-muller');
var seed = require('seed-random');
var qs = require('querystring');
var Utils = require('./utils');
var Raphael = require('./raphael-lite');

console.log('This is Literal Trees version LITERAL_TREES_VERSION');

var Tree = function(opts) {
    var tree = this;
    tree.PERSISTANT_LINK;
    tree.inputOptions = opts;
    tree.PAPER_WIDTH = opts.width;
    tree.PAPER_HEIGHT = opts.height;
    tree.TREE_MIN_X = Infinity; // Left-most branch tip of tree. Gets updated as tree is built.
    tree.TREE_MAX_X = 0; // Right-most branch tip of tree. Gets updated as tree is built.
    tree.TREE_MIN_Y = Infinity; // Remember y-axis is reversed.
    tree.TREE_MAX_Y = 0; // TODO: Where is this used?
    tree.paper = Raphael("#paper", tree.PAPER_WIDTH, tree.PAPER_HEIGHT);
    tree.WINDX = parseInt(opts.windx, 10) || 0;
    tree.WINDY = parseInt(opts.windy, 10) || 0;
    tree.TRUNK_ANGLE = opts.ta || 90;
    tree.TRUNK_HEIGHT_RATIO = opts.trunkheightratio || 0.3;
    tree.COLOR = opts.color || "black";
    tree.BACKGROUND_COLOR = opts.bgcolor || "none";
    tree.MAX_DEPTH = parseInt(opts.depth, 10) || 6;
    tree.ANGLE_RANGE_MEAN = parseInt(opts.arm, 10) || 65;
    tree.ANGLE_RANGE_VARIANCE = opts.arv || 5; // TODO: This will have to check for isNumber.
    tree.CIRCLE_ORIGINS = opts.co || false;
    tree.CIRCLE_ENDS = opts.ce || false;
    tree.BRANCH_AT_TIP = opts.bat;
    tree.BRANCH_LOCATION_DENOMINATOR = parseFloat(opts.bld, 10) || 3;

    if (!opts.seed) {
        // If we haven't been given a seed in the hash then call
        // Math.random to get a random seed, then base64 encode it, then
        // remove non-URL-friendly characters, then strip off the first 16
        // characters. Basically, we just want a manageable-size seed value that
        // is easily placed in the hash of the URL.
        opts.seed = Math.random().toString(35).substr(2, 16);
    }
    tree.seed = opts.seed;
    self.postMessage({event: 'seed', value: tree.seed});
    seed(tree.seed, {global: true});
};

Tree.prototype.branch = function(args) {
    var tree = this;
    var maxDepth = args.maxDepth;
    // TODO: Vary angle range as a function of depth?

    var queue = [{x: args.x, y: args.y, depth: 0, referenceAngle: args.referenceAngle, previousLength: 30}];
    while (queue.length) {
        var point = queue.shift();

        if (point.depth === maxDepth) {
            continue;
        }

        if (point.depth === 0) {
            // Draw the trunk downwards
            tree.paper.path(Utils.path('M', point.x, point.y, 'L', point.x, tree.PAPER_HEIGHT)).attr("stroke", tree.COLOR);
        }

        var angleRange = Normal() * tree.ANGLE_RANGE_VARIANCE + tree.ANGLE_RANGE_MEAN;
        var numBranches = Math.floor(Normal() * 0.5 + Utils.LinearTransform([0, maxDepth], [4, 8], point.depth));

        var relativeAngles = [];
        var minRelativeAngle = Infinity;
        for (var i = 0; i < numBranches; i++) {
            // TODO: Explain this.
            var relativeAngle = Normal() * 5 - (angleRange / 2) + i * angleRange / (numBranches - 1);
            if (Math.abs(relativeAngle) < Math.abs(minRelativeAngle)) {
                minRelativeAngle = relativeAngle;
            }
            relativeAngles.push(relativeAngle);
        }

        for (var i = 0; i < numBranches; i++) {
            var relativeAngle = relativeAngles[i];
            var absoluteAngle = point.referenceAngle + relativeAngle;
            var length = Normal() * 10 + Utils.LinearTransform([0, maxDepth], [75, 0], point.depth);
            if (length <= 0) {
                continue;
            }
            var branchOrigin = {x: point.x, y: point.y};

            if (!tree.BRANCH_AT_TIP && relativeAngle != minRelativeAngle) {
                var branchOriginOffset = Utils.LinearTransform([0, 1], [0, point.previousLength / tree.BRANCH_LOCATION_DENOMINATOR], Math.random());
                var xStartOffset = branchOriginOffset * Math.cos(Utils.rad(point.referenceAngle));
                var yStartOffset = branchOriginOffset * Math.sin(Utils.rad(point.referenceAngle));
                branchOrigin.x = point.x - xStartOffset;
                branchOrigin.y = point.y + yStartOffset;
            }

            if (tree.CIRCLE_ORIGINS) {
                tree.paper.circle(branchOrigin.x, branchOrigin.y, 2).attr({stroke: "none", fill: "black"});
            }

            var xOffset = length * Math.cos(Utils.rad(absoluteAngle));
            var yOffset = -length * Math.sin(Utils.rad(absoluteAngle));

            // Keep track of the outermost branch tips
            if (branchOrigin.x + xOffset < tree.TREE_MIN_X) tree.TREE_MIN_X = branchOrigin.x + xOffset;
            if (branchOrigin.x + xOffset > tree.TREE_MAX_X) tree.TREE_MAX_X = branchOrigin.x + xOffset;
            if (branchOrigin.y + yOffset < tree.TREE_MIN_Y) tree.TREE_MIN_Y = branchOrigin.y + yOffset;
            if (branchOrigin.y + yOffset > tree.TREE_MAX_Y) tree.TREE_MAX_Y = branchOrigin.y + yOffset;
            // RGB(147, 113, 68)

            // Pink: 255, 0, 71
            // var red = Math.floor(Utils.LinearTransform([0, maxDepth], [204, 74], point.depth));
            // var green = Math.floor(Utils.LinearTransform([0, maxDepth], [194, 46], point.depth));
            // var blue = Math.floor(Utils.LinearTransform([0, maxDepth], [182, 2], point.depth));
            // var color = Utils.rgb2hex(red, green, blue);
            var color = tree.COLOR;

            // var gray = 0; // Math.floor(Utils.LinearTransform([0, maxDepth], [150, 0], depth));

            // Draw the branch.
            tree.paper.path(Utils.path('M', branchOrigin.x, branchOrigin.y, 'l', xOffset, yOffset)).attr("stroke", color);

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

Tree.prototype.start = function(callback) {
    console.time('tree-rendering');
    var t0 = Date.now();
    var tree = this;

    tree.branch({
        x: tree.PAPER_WIDTH / 2,
        y: tree.PAPER_HEIGHT - (tree.PAPER_HEIGHT * tree.TRUNK_HEIGHT_RATIO),
        maxDepth: tree.MAX_DEPTH,
        referenceAngle: tree.TRUNK_ANGLE
    });

    console.timeEnd('tree-rendering');
    var renderingTime = Date.now() - t0;

    // Add more more metadata to the input tree.inputOptions and log all the info to
    // the logging endpoint.
    tree.inputOptions.tr = renderingTime;
    tree.inputOptions.seed = tree.seed;
    tree.inputOptions.version = 'LITERAL_TREES_VERSION';
    self.postMessage({event: 'metrics', value: qs.stringify(tree.inputOptions)});

    // paper.rect(TREE_MIN_X, TREE_MIN_Y, TREE_MAX_X - TREE_MIN_X, PAPER_HEIGHT - TREE_MIN_Y).attr("stroke", "lightgray");
    // paper.rect(0, 0, PAPER_WIDTH, PAPER_HEIGHT).attr("stroke", "lightgray");
    var xMargin = 0.05 * (tree.TREE_MAX_X - tree.TREE_MIN_X);
    var yMargin = 0.05 * (tree.PAPER_HEIGHT - tree.TREE_MIN_Y);
    tree.paper.setViewBox(tree.TREE_MIN_X - xMargin, tree.TREE_MIN_Y - yMargin, (tree.TREE_MAX_X - tree.TREE_MIN_X) + 2 * xMargin , (tree.PAPER_HEIGHT - tree.TREE_MIN_Y) + yMargin);

    // svg.setAttribute("preserveAspectRatio", 'xMidYMax');
    if (typeof callback === "function") {
        callback(tree.paper.toString());
    }
};

module.exports = Tree;
