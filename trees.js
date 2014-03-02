var PAPER_WIDTH = document.getElementById("paper").offsetWidth;
var PAPER_HEIGHT = window.innerHeight - 16; // document.getElementById("paper").offsetHeight;

var paper = Raphael("paper", PAPER_WIDTH, PAPER_HEIGHT);

var path = function() {
    var previousArgWasNumber = false;
    var pathString = "";
    Array.prototype.slice.call(arguments, 0).forEach(function(arg, index) {
        if (typeof arg === 'number' && previousArgWasNumber) {
            pathString += ","; // Assume all numbers are comma separated
        }

        pathString += arg;
        previousArgWasNumber = (typeof arg === 'number') ? true : false;
    });
    // console.log('PATH STRING', pathString);
    return pathString;
};

var transform = path; // Alias to path. Both are just conveniences.

var branch = function(args) {
    var x = args.x;
    var y = args.y;
    var levels = args.levels;
    var angleRange = args.angleRange;
    var limbAngle = args.limbAngle;
    console.log('Starting branch at ' + [x, y].join(','));

    if (levels === 0) {
        return;
    }

    var numBranches = 4; // Math.floor(Math.random() * 4); // TODO: Normal distribution should be used here.
    for (var i = 0; i < numBranches; i++) {
        var relativeAngle = -(angleRange / 2) + i * angleRange / (numBranches - 1); // Math.floor(Math.random() * angleRange);
        var length = 40; // Math.random() * 40; // TODO: Normal distribution should be used here.

        var b = paper.path(path('M', x, y, 'h', length));
        b.transform(transform("r", limbAngle, x, y, "r", relativeAngle, x, y));
        var endpoint = {
            x: x + length * Math.cos(-1 * (limbAngle + relativeAngle) * Math.PI / 180),
            y: y - length * Math.sin(-1 * (limbAngle + relativeAngle) * Math.PI / 180)
        };
        console.log('Endpoint', endpoint);
        // console.log('Ending branch from ' + [x, y].join(',') + ' at ' + [endpoint.x, endpoint.y].join(','));
        branch({
            x: endpoint.x,
            y: endpoint.y,
            levels: levels - 1,
            angleRange: angleRange, // TODO: Vary this?
            limbAngle: limbAngle + relativeAngle
        })
    }
};


var trunk = function(args) {
    var x0 = args.x0;
    var y0 = args.y0;
    var x1 = args.x1;
    var y1 = args.y1;
    var height = args.height;
    paper.path(path('M', x0, y0, 'L', x1, y1));
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

branch({
    x: trunkEndX,
    y: trunkEndY,
    levels: 5,
    angleRange: 70,
    limbAngle: -90
});

// var s = paper.rect(100, 100, 20, 20).attr({fill: 'blue', 'stroke-width': 0});
// var r = paper.rect(100, 100, 20, 20);
// var t = r.transform("t100,100r30,100,100s2,2,100,100r45s1.5");
// console.log('transform t', t);
