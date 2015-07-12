var Normal = require('box-muller');
var seed = require('seed-random');
var qs = require('querystring');
var Utils = require('./utils');
var Raphael = require('./raphael-lite');
var _ = require('underscore');
var defaultTreeOptions = require('./default-tree-options');
var TreeSizing = require('./tree-sizing');

console.log('[literal-trees] this is Literal Trees version LITERAL_TREES_VERSION');

var Tree = function(userOptions) {
    var tree = this;
    tree.userOptions = userOptions;
    tree.options = {};
    _.defaults(tree.options, userOptions)
    _.defaults(tree.options, defaultTreeOptions);
    var IS_DEBUG = tree.options.debug;
    if (IS_DEBUG) {
        console.log('[literal-trees] user options', tree.userOptions);
        console.log('[literal-trees] tree options', tree.options);
    }
    tree.PERSISTANT_LINK;
    tree.TREE_MIN_X = Infinity; // Left-most branch tip of tree. Gets updated as tree is built.
    tree.TREE_MAX_X = 0; // Right-most branch tip of tree. Gets updated as tree is built.
    tree.TREE_MIN_Y = Infinity; // Remember y-axis is reversed.
    tree.TREE_MAX_Y = 0; // TODO: Where is this used?
    tree.paper = Raphael("#paper", tree.options.paperWidth, tree.options.paperHeight);

    if (!tree.userOptions.seed) {
        // If we haven't been given a seed in the hash then call
        // Math.random to get a random seed, then base64 encode it, then
        // remove non-URL-friendly characters, then strip off the first 16
        // characters. Basically, we just want a manageable-size seed value that
        // is easily placed in the hash of the URL.
        tree.userOptions.seed = Math.random().toString(35).substr(2, 16);
    }
    tree.seed = tree.userOptions.seed;
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
            var height = tree.options.paperHeight * tree.options.trunkheight;
            if (point.y + height < tree.TREE_MIN_Y) tree.TREE_MIN_Y = point.y + height;
            if (point.y + height > tree.TREE_MAX_Y) tree.TREE_MAX_Y = point.y + height;

            if (tree.options.showbranches) {
                // Draw the trunk downwards
                tree.paper.path(Utils.path('M', point.x, point.y, 'L', point.x, height)).attr("stroke", tree.options.color);
            }

            if (tree.options.co) {
                tree.paper.circle(point.x, height, tree.options.circleradius).attr({stroke: "none", fill: tree.options.color});
            }

            if (tree.options.ce) {
                tree.paper.circle(point.x, point.y, tree.options.circleradius).attr({stroke: "none", fill: tree.options.color});
            }
        }

        var branchWidth = point.depth < 3 ? 4 : 1;

        var angleRange = Normal() * tree.options.arv + tree.options.arm;
        var numBranches = Math.floor(Normal() * 0.5 + Utils.LinearTransform([0, maxDepth], [4, 8], point.depth));

        var relativeAngles = [];
        var minRelativeAngle = Infinity;
        for (var i = 0; i < numBranches; i++) {
            // TODO: Explain this.
            relativeAngle = Normal() * 5 - (angleRange / 2) + i * angleRange / (numBranches - 1);
            if (Math.abs(relativeAngle) < Math.abs(minRelativeAngle)) {
                minRelativeAngle = relativeAngle;
            }
            relativeAngles.push(relativeAngle);
        }

        for (i = 0; i < numBranches; i++) {
            var relativeAngle = relativeAngles[i];
            var absoluteAngle = point.referenceAngle + relativeAngle;
            var length = Normal() * 10 + Utils.LinearTransform([0, maxDepth], [75, 0], point.depth);
            if (length <= 0) {
                continue;
            }
            var branchOrigin = {x: point.x, y: point.y};

            if (!tree.options.bat && relativeAngle != minRelativeAngle) {
                var branchOriginOffset = Utils.LinearTransform([0, 1], [0, point.previousLength / tree.options.bld], Math.random());
                var xStartOffset = branchOriginOffset * Math.cos(Utils.rad(point.referenceAngle));
                var yStartOffset = branchOriginOffset * Math.sin(Utils.rad(point.referenceAngle));
                branchOrigin.x = point.x - xStartOffset;
                branchOrigin.y = point.y + yStartOffset;
            }

            if (tree.options.co) {
                tree.paper.circle(branchOrigin.x, branchOrigin.y, tree.options.circleradius).attr({stroke: "none", fill: tree.options.color});
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

            // var gray = 0; // Math.floor(Utils.LinearTransform([0, maxDepth], [150, 0], depth));

            // Draw the branch.
            if (tree.options.showbranches) {
                tree.paper.path(Utils.path('M', branchOrigin.x, branchOrigin.y, 'l', xOffset, yOffset)).attr("stroke", tree.options.color);
            }

            if (tree.options.ce) {
                tree.paper.circle(branchOrigin.x + xOffset, branchOrigin.y + yOffset, tree.options.circleradius).attr({stroke: "none", fill: tree.options.color});
            }

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
    var t0 = Date.now();
    var tree = this;

    tree.branch({
        x: 0, // tree.options.paperWidth / 2,
        y: 0, // tree.options.paperHeight - (tree.options.paperHeight * tree.options.trunkheight),
        maxDepth: tree.options.depth,
        referenceAngle: tree.options.trunkangle
    });

    var renderingTime = Date.now() - t0;

    // Add more more metadata to the input tree.userOptions and log all the info to
    // the logging endpoint.
    tree.userOptions.tr = renderingTime;
    tree.userOptions.seed = tree.seed;
    tree.userOptions.version = 'LITERAL_TREES_VERSION';
    self.postMessage({event: 'metrics', value: qs.stringify(tree.userOptions)});

    // paper.rect(TREE_MIN_X, TREE_MIN_Y, TREE_MAX_X - TREE_MIN_X, PAPER_HEIGHT - TREE_MIN_Y).attr("stroke", "lightgray");
    // paper.rect(0, 0, PAPER_WIDTH, PAPER_HEIGHT).attr("stroke", "lightgray");
    var treeHeight = tree.TREE_MAX_Y - tree.TREE_MIN_Y;
    var treeWidth = tree.TREE_MAX_X - tree.TREE_MIN_X;

    // This function will calculate the appropriate view box, taking
    // into account tree.options.aspectratio if it is defined. If
    // aspectratio is undefined the function will try to guess if this
    // is a small mobile device where it makes the most sense to return
    // a view box which matches the aspect ratio of the device. On
    // desktop browsers with large screens it isn't as important.
    var viewBox = TreeSizing.calculateViewBox({
        aspectratio: tree.options.aspectratio,
        treeWidth: treeWidth,
        treeHeight: treeHeight,
        margin: tree.options.margin,
        treeMinX: tree.TREE_MIN_X,
        treeMinY: tree.TREE_MIN_Y,
        clientWidth: tree.options.clientWidth,
        clientHeight: tree.options.clientHeight,
        screenWidth: tree.options.screenWidth,
        screenHeight: tree.options.screenHeight,
        sizingmethod: tree.options.sizingmethod
    });

    var verticalScale = tree.options.paperHeight / treeHeight;
    var horizontalScale = tree.options.paperWidth / treeWidth;
    var scaleRatio = Math.min(verticalScale, horizontalScale);

    // tree.paper.setSize(scaleRatio * treeWidth - 2 * tree.options.margin, scaleRatio * treeHeight - tree.options.margin);
    tree.paper.setSize('100%', '100%');
    // tree.paper.setViewBox(tree.TREE_MIN_X, tree.TREE_MIN_Y, treeWidth, treeHeight);
    tree.paper.setViewBox(viewBox.x, viewBox.y, viewBox.width, viewBox.height);

    if (tree.options.debug) {
        tree.paper.rect(viewBox.x, viewBox.y, viewBox.width, viewBox.height).attr({fill: 'none', strokeWidth: 2, stroke: 'red'});
        tree.paper.rect(tree.TREE_MIN_X - tree.options.margin, tree.TREE_MIN_Y - tree.options.margin, treeWidth + 2 * tree.options.margin, treeHeight + 2 * tree.options.margin).attr({fill: 'none', strokeWidth: 2, stroke: 'red'});
        tree.paper.rect(tree.TREE_MIN_X, tree.TREE_MIN_Y, treeWidth, treeHeight).attr({fill: 'none', strokeWidth: 2, stroke: 'blue'});
        // tree.paper.path(Utils.path('M', tree.TREE_MIN_X, tree.TREE_MIN_Y, 'L', tree.TREE_MAX_X, tree.TREE_MIN_Y)).attr("stroke", 'red');
        // tree.paper.path(Utils.path('M', tree.TREE_MIN_X, tree.TREE_MAX_Y, 'L', tree.TREE_MAX_X, tree.TREE_MAX_Y)).attr("stroke", 'green');
        // tree.paper.path(Utils.path('M', tree.TREE_MIN_X, tree.TREE_MIN_Y, 'L', tree.TREE_MIN_X, tree.TREE_MAX_Y)).attr("stroke", 'yellow');
        // tree.paper.path(Utils.path('M', tree.TREE_MAX_X, tree.TREE_MIN_Y, 'L', tree.TREE_MAX_X, tree.TREE_MAX_Y)).attr("stroke", 'blue');
        // tree.paper.path(Utils.path('M', tree.TREE_MIN_X, tree.options.paperHeight, 'L', tree.TREE_MAX_X, tree.options.paperHeight)).attr("stroke", 'violet');
    }

    // svg.setAttribute("preserveAspectRatio", 'xMidYMax');
    if (typeof callback === "function") {
        callback(tree.paper.toString(), viewBox.width, viewBox.height);
    }
};

module.exports = Tree;
