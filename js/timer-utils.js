module.exports.startTimer = function(str) {
    if (console && console.time) {
        console.time(str);
    }
}

module.exports.endTimer = function(str) {
    if (console && console.time) {
        console.timeEnd(str);
    }
}
