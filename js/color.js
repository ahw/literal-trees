var chroma = require('chroma-js')

var palettes = {
    molokai: [
        '#716CED',
        '#1C3DA8',
        '#72DCB2',
        '#D9D9D9'
    ]
};

var currentPalette = 'molokai';
var lastStickyColor;

module.exports.getStickyColor = function() {
    if (Math.random() < 0.01 || typeof lastStickyColor === 'undefined') {
        var index = Math.floor(Math.random() * palettes[currentPalette].length);
        lastStickyColor = palettes[currentPalette][index];
    }
    return lastStickyColor;
};

var scale = chroma.scale(['black', 'white']).domain([0, 5]);
module.exports.getDepthColor = function(depth) {
    return scale(depth).css();
};
