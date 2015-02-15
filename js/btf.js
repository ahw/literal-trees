requirejs(['zero-clipboard-2.0.0-beta.3'], function(ZeroClipboard) {
    console.log('this is btf.js');

    var serializer = new XMLSerializer();
    var svg = paper.getElementsByTagName("svg")[0];
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svg);
    console.time('compress-svg');
    var svgStringCompressed = LZString.compressToBase64(svgString);
    console.timeEnd('compress-svg');
    console.log('Size of uncompressed SVG string', svgString.length);
    console.log('Size of compressed SVG string', svgStringCompressed.length, (100 * svgStringCompressed.length / svgString.length).toFixed(2) + '% of original');
    $.ajax({
        type: 'POST',
        url: 'http://maple.literal-trees.co/svg',
        dataType: 'json',
        data: {compressedSvg: svgStringCompressed},
    }).done(function() {
        console.log('Finished posting compressed SVG to server');
    }).fail(function() {
    }).always(function() {
    });

    ZeroClipboard.config({
        forceHandCursor: false,
        zIndex: 0
    });

    var client = new ZeroClipboard(document.getElementById("svg-copy-button"));
    client.on("ready", function(readyEvent) {
        client.on("aftercopy", function(event) {
            // this === client
            // event.target === the element that was clicked
        });
    });
});
