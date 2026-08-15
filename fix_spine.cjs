const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/let spineWidthInches = 0;\n    if \(paperType === 'cream'\) \{\n      spineWidthInches = \(estimatedPageCount \* 0\.0025\) \+ 0\.06;\n    \} else \{\n      spineWidthInches = \(estimatedPageCount \* 0\.002252\) \+ 0\.06;\n    \}/g,
`const KDP_ALLOWANCE = 0.06;
    let paperMultiplier;
    if (paperType === 'cream') {
        paperMultiplier = 0.0025;
    } else {
        paperMultiplier = 0.002252;
    }
    const spineWidthInches = (estimatedPageCount * paperMultiplier) + KDP_ALLOWANCE;`);

fs.writeFileSync('server.ts', code);
