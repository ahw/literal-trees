module.exports.shouldForceAspectRatio = function() {
    return false;
}

module.exports.calculateViewBox = function(args) {
    var viewBox = {
        x: args.treeMinX - args.margin,
        y: args.treeMinY - args.margin,
        width: args.treeWidth + 2 * args.margin,
        // Why is viewbox height not treeHeight + 2*margin?
        // Because we don't care about the bottom margin.
        height: args.treeHeight + args.margin
    };

    return viewBox;
}
