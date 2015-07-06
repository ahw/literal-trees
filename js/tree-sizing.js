module.exports.shouldForceAspectRatio = function() {
    return false;
}

/**
 * Argument should be an object with the following keys:
 *
 *  aspectratio
 *  treeWidth
 *  treeHeight
 *  margin
 *  treeMinX
 *  treeMinY
 *  sizingmethod
 *  clientWidth
 *  clientHeight
 *  screenWidth
 *  screenHeight
 */
module.exports.calculateViewBox = function(args) {
    var imageWidth = args.treeWidth + 2 * args.margin;
    // Why is viewbox height not treeHeight + 2*margin?
    // Because we don't care about the bottom margin.
    var imageHeight = args.treeHeight + args.margin;

    // The standard viewbox being used since version 0.1.0.
    var viewBox = {
        x: args.treeMinX - args.margin,
        y: args.treeMinY - args.margin,
        width: imageWidth,
        height: imageHeight
    };

    if (args.screenWidth === args.clientWidth) {
        // Assert: viewport is full width of device. Could be on a phone.
        var screenAspectRatio = args.screenHeight / args.screenWidth;
        var imageAspectRatio = imageHeight / imageWidth;

        if (screenAspectRatio > 1) {
            // Assert: viewport is tall and skinny. Or at least height is
            // greater than width. Probably on something mobile. To prevent
            // having image dimensions that are slightly mis-matched with
            // the actual aspect ratio of the device, crop/pad the viewBox
            // so that it matches screenAspectRatio.
            if (args.sizingmethod === 'contain') {
                // var scaleRatio = Math.min(verticalScale, horizontalScale);
                // var newHeight = imageHeight * scaleRatio;
                // var newWidth = imageWidth * scaleRatio;
                if (imageAspectRatio > screenAspectRatio) {
                    // Need to pad the width
                    var extraWidthNeeded = (imageHeight / args.screenHeight) * args.screenWidth - imageWidth;
                    viewBox.x = viewBox.x - (extraWidthNeeded/2);
                    viewBox.width = viewBox.width + extraWidthNeeded;
                    self.postMessage({event: 'log', msg: 'Extra width needed: ' + extraWidthNeeded});
                } else if (imageAspectRatio < screenAspectRatio) {
                    var extraHeightNeeded = (imageWidth / args.screenWidth) * args.screenHeight - imageHeight;
                    viewBox.y = viewBox.y - extraHeightNeeded;
                    viewBox.height = viewBox.height + extraHeightNeeded;
                    self.postMessage({event: 'log', msg: 'Extra height needed: ' + extraHeightNeeded});
                } else {
                    // Assert: it's exactly the same. No adjustment needed.
                }
            } else if (args.sizingmethod === 'cover') {
                // Nothing, for now. TODO: Implement this.
            }
        }
    }

    return viewBox;
}
