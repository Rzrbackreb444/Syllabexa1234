const bwipjs = require('bwip-js');

bwipjs.toBuffer({
    bcid: 'ean13',       // Barcode type
    text: '9781234567897',    // Text to encode
    addontext: '52499',       // EAN-5 Addon
    scale: 3,               // 3x scaling factor
    height: 15,              // Bar height, in millimeters
    includetext: true,            // Show human-readable text
    textxalign: 'center',        // Always good to set this
}, function (err, png) {
    if (err) {
        console.error(err);
    } else {
        console.log("Success!");
    }
});
