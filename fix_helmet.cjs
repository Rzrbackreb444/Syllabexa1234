const fs = require('fs');
let file = fs.readFileSync('src/main.tsx', 'utf8');

file = file.replace(/import \{ ToastProvider \} from '\.\/lib\/ToastContext\.tsx';/, "import { ToastProvider } from './lib/ToastContext.tsx';\nimport { HelmetProvider } from 'react-helmet-async';");

file = file.replace(/<App \/>/, "<HelmetProvider><App /></HelmetProvider>");

fs.writeFileSync('src/main.tsx', file);
