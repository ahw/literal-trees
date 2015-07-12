function detect(obj, callback) {
    var hasTouch = false;
    obj.hasTouch = false;
    var interactionMode;

    document.onpointerdown = function(e) {
        interactionMode = e.pointerType;
        obj.interactionMode = interactionMode;
        if (e.pointerType === 'touch') {
            hasTouch = true;
            obj.hasTouch = true;
        }
        callback(interactionMode);

    }

    document.ontouchstart = function(e) {
        hasTouch = true;
        obj.hasTouch = true;
        if (!interactionMode) {
            interactionMode = 'touch';
            obj.interactionMode = 'touch';
        }
        callback('touch');
    }

    document.onmousedown = function(e) {
        if (!interactionMode) {
            interactionMode = 'mouse';
            obj.interactionMode = 'mouse';
            // mousedown fires even when touch events fire, so only trigger
            // if interactionMode hasn't been set.
        }
        callback('mouse');
    }

    document.onkeydown = function(e) {
        if (!interactionMode) {
            interactionMode = 'keyboard';
            obj.interactionMode = 'keyboard';
        }
        callback('keyboard');
    }
}

module.exports = detect;
