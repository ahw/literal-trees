function getViewportDimensions() {
}

function getDeviceDimensions() {
}

function getDocumentDimensions() {
}

// Get the viewport dimensions and the documention dimensions. If the
// viewport width equals the document width then perhaps we can assume we're
// on a phone or tablet where the width will always match? If that's the
// case then just make the height of the image the same as the height of the
// device to prevent the slightly-too-short problem generating images on
// iPhone.
